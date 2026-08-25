import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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

    // ── GET PROFILE ──────────────────────────────────────────
    if (action === 'get_profile') {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();

      // Only fundi role can access fundi service
      if (!profile || profile.role !== 'fundi') {
        return new Response(JSON.stringify({ success: false, error: 'Not a fundi account' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: fundiProfile, error } = await supabase
        .from('fundi_profiles')
        .select(`
          id, skills, service_categories, service_areas, verification_status,
          is_online, rating, total_jobs, available_earnings, pending_earnings,
          bio, experience_years, portfolio_images, bank_account_name,
          bank_account_number, bank_name, mpesa_number, latitude, longitude,
          user_profiles!inner(id, first_name, last_name, phone, email, avatar_url)
        `)
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data: fundiProfile }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── UPDATE ONLINE STATUS ─────────────────────────────────
    if (action === 'toggle_online') {
      const { is_online, latitude, longitude } = payload;

      const updates: any = { is_online };
      if (latitude !== undefined) updates.latitude = latitude;
      if (longitude !== undefined) updates.longitude = longitude;
      if (is_online) updates.last_location_update = new Date().toISOString();

      const { error } = await supabase
        .from('fundi_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data: is_online }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── UPDATE LOCATION ──────────────────────────────────────
    if (action === 'update_location') {
      const { latitude, longitude } = payload;

      await supabase
        .from('fundi_profiles')
        .update({ latitude, longitude, last_location_update: new Date().toISOString() })
        .eq('id', user.id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── GET EARNINGS ─────────────────────────────────────────
    if (action === 'get_earnings') {
      const { data: fp } = await supabase
        .from('fundi_profiles')
        .select('available_earnings, pending_earnings, total_jobs')
        .eq('id', user.id)
        .single();

      // Calculate this month's earnings from completed payments
      const firstOfMonth = new Date();
      firstOfMonth.setDate(1); firstOfMonth.setHours(0, 0, 0, 0);

      const { data: monthPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('fundi_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', firstOfMonth.toISOString());

      const thisMonth = (monthPayments || []).reduce((sum: number, p: any) => sum + (p.amount * 0.85), 0);

      return new Response(JSON.stringify({
        success: true,
        data: {
          available: fp?.available_earnings || 0,
          pending: fp?.pending_earnings || 0,
          thisMonth: Math.round(thisMonth),
          lastMonth: 0, // Would need last-month query
          totalPaid: 0, // Sum of paid payouts
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── SUBMIT APPLICATION ───────────────────────────────────
    if (action === 'submit_application') {
      const { skills, service_categories, service_areas, bio, experience_years } = payload;

      // Ensure fundi profile exists
      await supabase.from('fundi_profiles').upsert({
        id: user.id,
        skills: skills || [],
        service_categories: service_categories || [],
        service_areas: service_areas || [],
        bio, experience_years,
        verification_status: 'pending',
      });

      return new Response(JSON.stringify({
        success: true,
        data: { application_id: `app_${user.id}` },
        message: 'Application submitted. We will review within 24 hours.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('patafundi-fundi error:', err);
    return new Response(JSON.stringify({ success: false, error: `Server error: ${err}` }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
