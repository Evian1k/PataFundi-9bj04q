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

    // ── GET NOTIFICATIONS (role-isolated) ────────────────────
    if (action === 'get_notifications') {
      const { audience } = payload;

      // Verify user's role matches requested audience
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const roleAudienceMap: Record<string, string> = {
        customer: 'customer',
        fundi: 'fundi',
        staff: 'staff',
        super_admin: 'super_admin',
      };

      const expectedAudience = roleAudienceMap[profile?.role || ''];
      if (expectedAudience !== audience) {
        return new Response(JSON.stringify({ success: false, error: 'Access denied' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('id, title, body, type, is_read, data, created_at')
        .eq('user_id', user.id)
        .eq('audience', audience)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data: notifications }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── MARK AS READ ─────────────────────────────────────────
    if (action === 'mark_read') {
      const { notification_id } = payload;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification_id)
        .eq('user_id', user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── MARK ALL AS READ ─────────────────────────────────────
    if (action === 'mark_all_read') {
      const { audience } = payload;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('audience', audience);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── GET UNREAD COUNT ─────────────────────────────────────
    if (action === 'unread_count') {
      const { audience } = payload;

      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('audience', audience)
        .eq('is_read', false);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data: count || 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('patafundi-notifications error:', err);
    return new Response(JSON.stringify({ success: false, error: `Server error: ${err}` }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
