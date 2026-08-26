import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Platform commission rate — NEVER surfaced to customers or fundis
const PLATFORM_COMMISSION = 0.15; // 15% internal — backend only

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { action, ...payload } = await req.json();

    // ── INITIATE PAYMENT ─────────────────────────────────────
    if (action === 'initiate_payment') {
      const { job_id, amount, method, mpesa_number } = payload;

      // Verify job ownership
      const { data: job } = await supabase.from('jobs').select('id, customer_id, fundi_id').eq('id', job_id).single();
      if (!job || job.customer_id !== user.id) {
        return new Response(JSON.stringify({ success: false, error: 'Access denied' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const reference = `PF${Date.now()}`;

      const { data: payment, error } = await supabase
        .from('payments')
        .insert({
          job_id,
          customer_id: user.id,
          fundi_id: job.fundi_id,
          amount,
          method,
          status: 'processing',
          reference,
          mpesa_number,
        })
        .select()
        .single();

      if (error) throw error;

      // Update job status
      await supabase.from('jobs').update({ status: 'payment_processing' }).eq('id', job_id);
      await supabase.from('job_timeline').insert({ job_id, status: 'payment_processing' });

      // NOTE: Real M-Pesa/Stripe integration would trigger here via external API
      // For now we simulate processing — backend will update on webhook
      return new Response(JSON.stringify({
        success: true,
        data: { transaction_id: payment.id, status: 'processing', reference },
        message: method === 'mpesa' ? 'STK Push sent to your phone. Confirm on your handset.' : 'Payment processing.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── CONFIRM PAYMENT (simulate success) ───────────────────
    if (action === 'confirm_payment') {
      const { transaction_id } = payload;

      const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', transaction_id)
        .eq('customer_id', user.id)
        .single();

      if (fetchError || !payment) {
        return new Response(JSON.stringify({ success: false, error: 'Payment not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Mark payment complete
      const { error } = await supabase
        .from('payments')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', transaction_id);

      if (error) throw error;

      // Update job status
      await supabase.from('jobs').update({ status: 'payment_complete', final_price: payment.amount }).eq('id', payment.job_id);
      await supabase.from('job_timeline').insert({ job_id: payment.job_id, status: 'payment_complete' });

      // Internally calculate fundi earnings — commission never exposed to UI
      const fundiEarnings = Math.round(payment.amount * (1 - PLATFORM_COMMISSION));
      // Get current values then update (RPC increment not available as update value)
      const { data: fp } = await supabase
        .from('fundi_profiles')
        .select('available_earnings, total_jobs')
        .eq('id', payment.fundi_id)
        .single();
      if (fp) {
        await supabase
          .from('fundi_profiles')
          .update({
            available_earnings: (fp.available_earnings || 0) + fundiEarnings,
            total_jobs: (fp.total_jobs || 0) + 1,
          })
          .eq('id', payment.fundi_id);
      }

      return new Response(JSON.stringify({
        success: true,
        data: { ...payment, status: 'completed' },
        message: 'Payment confirmed successfully.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── GET PAYMENT HISTORY ──────────────────────────────────
    if (action === 'get_history') {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('id, job_id, amount, method, status, reference, created_at, completed_at')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data: payments }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── REQUEST FUNDI PAYOUT ─────────────────────────────────
    if (action === 'request_payout') {
      const { amount } = payload;

      // Get fundi profile to check available earnings and bank details
      const { data: fundiProfile } = await supabase
        .from('fundi_profiles')
        .select('available_earnings, bank_account_name, bank_account_number, bank_name, mpesa_number')
        .eq('id', user.id)
        .single();

      if (!fundiProfile) {
        return new Response(JSON.stringify({ success: false, error: 'Fundi profile not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (fundiProfile.available_earnings < amount) {
        return new Response(JSON.stringify({ success: false, error: 'Insufficient available earnings' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: payout, error } = await supabase
        .from('fundi_payouts')
        .insert({
          fundi_id: user.id,
          amount,
          status: 'pending',
          bank_account_name: fundiProfile.bank_account_name,
          bank_account_number: fundiProfile.bank_account_number,
          bank_name: fundiProfile.bank_name,
          mpesa_number: fundiProfile.mpesa_number,
        })
        .select()
        .single();

      if (error) throw error;

      // Deduct from available
      await supabase
        .from('fundi_profiles')
        .update({ available_earnings: fundiProfile.available_earnings - amount, pending_earnings: amount })
        .eq('id', user.id);

      return new Response(JSON.stringify({
        success: true,
        data: payout,
        message: 'Payout requested. Processing within 24 hours.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── GET PAYOUT HISTORY ───────────────────────────────────
    if (action === 'get_payout_history') {
      const { data: payouts, error } = await supabase
        .from('fundi_payouts')
        .select('id, amount, status, bank_account_name, bank_account_number, bank_name, mpesa_number, requested_at, processed_at')
        .eq('fundi_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data: payouts }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── SUBMIT DISPUTE ───────────────────────────────────────
    if (action === 'submit_dispute') {
      const { job_id, reason, description } = payload;

      const { data: job } = await supabase.from('jobs').select('id, customer_id, fundi_id, agreed_price').eq('id', job_id).single();
      if (!job || job.customer_id !== user.id) {
        return new Response(JSON.stringify({ success: false, error: 'Access denied' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: dispute, error } = await supabase
        .from('disputes')
        .insert({ job_id, customer_id: user.id, fundi_id: job.fundi_id, reason, description, amount: job.agreed_price })
        .select()
        .single();

      if (error) throw error;
      await supabase.from('jobs').update({ status: 'disputed' }).eq('id', job_id);

      return new Response(JSON.stringify({
        success: true,
        data: { dispute_id: dispute.id },
        message: 'Dispute submitted. Our team will review within 24 hours.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('patafundi-payments error:', err);
    return new Response(JSON.stringify({ success: false, error: `Server error: ${err}` }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
