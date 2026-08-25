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

    // ── FIND AVAILABLE FUNDIS ────────────────────────────────
    if (action === 'find_fundis') {
      const { service_category, lat, lng } = payload;

      // Get online, verified fundis that offer the service category
      const { data: fundis, error } = await supabase
        .from('fundi_profiles')
        .select(`
          id, skills, service_categories, service_areas, rating, total_jobs,
          is_online, verification_status, bio, experience_years,
          latitude, longitude,
          user_profiles!inner(id, first_name, last_name, avatar_url, phone)
        `)
        .eq('is_online', true)
        .eq('verification_status', 'verified')
        .contains('service_categories', [service_category]);

      if (error) throw error;

      // Calculate approximate distance and sort by rating
      const fundisWithDistance = (fundis || []).map((f: any) => {
        let distKm = 5; // default
        if (f.latitude && f.longitude && lat && lng) {
          const R = 6371;
          const dLat = ((f.latitude - lat) * Math.PI) / 180;
          const dLng = ((f.longitude - lng) * Math.PI) / 180;
          const a = Math.sin(dLat/2)**2 + Math.cos(lat*Math.PI/180) * Math.cos(f.latitude*Math.PI/180) * Math.sin(dLng/2)**2;
          distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        }
        return {
          ...f,
          distance_km: Math.round(distKm * 10) / 10,
          eta_minutes: Math.round(distKm * 3 + 5),
        };
      }).sort((a: any, b: any) => b.rating - a.rating);

      const best = fundisWithDistance[0] || null;

      return new Response(JSON.stringify({ success: !!best, data: best }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── ASSIGN FUNDI TO JOB ──────────────────────────────────
    if (action === 'assign_fundi') {
      const { job_id, fundi_id } = payload;

      // Verify requesting user owns the job
      const { data: job } = await supabase.from('jobs').select('id, customer_id').eq('id', job_id).single();
      if (!job || job.customer_id !== user.id) {
        return new Response(JSON.stringify({ success: false, error: 'Access denied' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabase
        .from('jobs')
        .update({ fundi_id, status: 'fundi_assigned', updated_at: new Date().toISOString() })
        .eq('id', job_id);

      if (error) throw error;
      await supabase.from('job_timeline').insert({ job_id, status: 'fundi_assigned' });

      // Create chat room
      await supabase.from('chat_rooms').insert({
        job_id,
        customer_id: user.id,
        fundi_id,
      }).onConflict('job_id').ignore();

      // Insert system message
      const { data: room } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('job_id', job_id)
        .single();

      if (room) {
        await supabase.from('chat_messages').insert({
          room_id: room.id,
          sender_id: user.id,
          sender_role: 'customer',
          type: 'system',
          content: 'A Fundi has been assigned to your job.',
          read_by: [],
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('patafundi-matching error:', err);
    return new Response(JSON.stringify({ success: false, error: `Server error: ${err}` }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
