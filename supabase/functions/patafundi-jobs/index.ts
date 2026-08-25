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

    // ── CREATE JOB ───────────────────────────────────────────
    if (action === 'create_job') {
      const { service_category, title, description, photos, lat, lng, address, area, city,
              urgency, scheduled_at, base_rate, distance_fee, travel_fee, urgency_multiplier,
              estimated_total, min_total, max_total } = payload;

      const { data: job, error } = await supabase
        .from('jobs')
        .insert({
          customer_id: user.id,
          service_category, title, description, photos: photos || [],
          lat, lng, address, area, city, urgency, scheduled_at,
          base_rate, distance_fee, travel_fee, urgency_multiplier,
          estimated_total, min_total, max_total,
          status: 'requested',
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial timeline entry
      await supabase.from('job_timeline').insert({ job_id: job.id, status: 'requested' });

      return new Response(JSON.stringify({ success: true, data: job }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── GET CUSTOMER JOBS ────────────────────────────────────
    if (action === 'get_customer_jobs') {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*, job_timeline(*)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Attach fundi public info (no commission data)
      const jobsWithFundi = await Promise.all((jobs || []).map(async (job: any) => {
        if (job.fundi_id) {
          const { data: fundiProfile } = await supabase
            .from('user_profiles')
            .select('id, first_name, last_name, avatar_url')
            .eq('id', job.fundi_id)
            .single();
          const { data: fundiData } = await supabase
            .from('fundi_profiles')
            .select('rating, is_verified')
            .eq('id', job.fundi_id)
            .single();
          job.fundi = { ...(fundiProfile || {}), ...(fundiData || {}) };
        }
        return job;
      }));

      return new Response(JSON.stringify({ success: true, data: jobsWithFundi }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── GET FUNDI JOBS ───────────────────────────────────────
    if (action === 'get_fundi_jobs') {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*, job_timeline(*)')
        .eq('fundi_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Attach customer public info
      const jobsWithCustomer = await Promise.all((jobs || []).map(async (job: any) => {
        const { data: custProfile } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, avatar_url')
          .eq('id', job.customer_id)
          .single();
        job.customer = custProfile || {};
        return job;
      }));

      return new Response(JSON.stringify({ success: true, data: jobsWithCustomer }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── GET JOB BY ID ────────────────────────────────────────
    if (action === 'get_job') {
      const { job_id } = payload;
      const { data: job, error } = await supabase
        .from('jobs')
        .select('*, job_timeline(*)')
        .eq('id', job_id)
        .or(`customer_id.eq.${user.id},fundi_id.eq.${user.id}`)
        .single();

      if (error || !job) {
        return new Response(JSON.stringify({ success: false, error: 'Job not found or access denied' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, data: job }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── UPDATE JOB STATUS ────────────────────────────────────
    if (action === 'update_status') {
      const { job_id, status, note } = payload;

      // Verify user is customer or fundi for this job
      const { data: job } = await supabase
        .from('jobs')
        .select('id, customer_id, fundi_id, status')
        .eq('id', job_id)
        .single();

      if (!job || (job.customer_id !== user.id && job.fundi_id !== user.id)) {
        return new Response(JSON.stringify({ success: false, error: 'Access denied' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: updated, error } = await supabase
        .from('jobs')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', job_id)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('job_timeline').insert({ job_id, status, note });

      return new Response(JSON.stringify({ success: true, data: updated }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── FUNDI RESPOND TO JOB ─────────────────────────────────
    if (action === 'fundi_respond') {
      const { job_id, accept } = payload;

      const { data: job } = await supabase.from('jobs').select('id, fundi_id').eq('id', job_id).single();
      if (!job || job.fundi_id !== user.id) {
        return new Response(JSON.stringify({ success: false, error: 'Access denied' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const newStatus = accept ? 'fundi_accepted' : 'requested';
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus, fundi_id: accept ? user.id : null })
        .eq('id', job_id);

      if (error) throw error;
      await supabase.from('job_timeline').insert({ job_id, status: newStatus });

      return new Response(JSON.stringify({ success: true, data: accept }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('patafundi-jobs error:', err);
    return new Response(JSON.stringify({ success: false, error: `Server error: ${err}` }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
