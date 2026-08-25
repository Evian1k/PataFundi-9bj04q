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

    // ── GET OR CREATE CHAT ROOM ──────────────────────────────
    if (action === 'get_room') {
      const { job_id } = payload;

      const { data: room, error } = await supabase
        .from('chat_rooms')
        .select('id, job_id, customer_id, fundi_id, created_at, updated_at')
        .eq('job_id', job_id)
        .single();

      if (error || !room) {
        return new Response(JSON.stringify({ success: false, error: 'Chat room not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify user is a participant
      if (room.customer_id !== user.id && room.fundi_id !== user.id) {
        return new Response(JSON.stringify({ success: false, error: 'Access denied' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, data: room }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── GET MESSAGES ─────────────────────────────────────────
    if (action === 'get_messages') {
      const { room_id } = payload;

      // Verify participant
      const { data: room } = await supabase
        .from('chat_rooms')
        .select('customer_id, fundi_id')
        .eq('id', room_id)
        .single();

      if (!room || (room.customer_id !== user.id && room.fundi_id !== user.id)) {
        return new Response(JSON.stringify({ success: false, error: 'Access denied' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('id, sender_id, sender_role, type, content, image_url, read_by, created_at')
        .eq('room_id', room_id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data: messages }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── SEND MESSAGE ─────────────────────────────────────────
    if (action === 'send_message') {
      const { room_id, sender_role, type, content, image_url } = payload;

      // Verify participant
      const { data: room } = await supabase
        .from('chat_rooms')
        .select('customer_id, fundi_id')
        .eq('id', room_id)
        .single();

      if (!room || (room.customer_id !== user.id && room.fundi_id !== user.id)) {
        return new Response(JSON.stringify({ success: false, error: 'Access denied' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id,
          sender_id: user.id,
          sender_role,
          type,
          content,
          image_url,
          read_by: [user.id],
        })
        .select()
        .single();

      if (error) throw error;

      // Update room timestamp
      await supabase.from('chat_rooms').update({ updated_at: new Date().toISOString() }).eq('id', room_id);

      return new Response(JSON.stringify({ success: true, data: message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── MARK AS READ ─────────────────────────────────────────
    if (action === 'mark_read') {
      const { room_id } = payload;

      const { data: messages } = await supabase
        .from('chat_messages')
        .select('id, read_by')
        .eq('room_id', room_id)
        .not('read_by', 'cs', `{${user.id}}`);

      if (messages && messages.length > 0) {
        for (const msg of messages) {
          await supabase
            .from('chat_messages')
            .update({ read_by: [...(msg.read_by || []), user.id] })
            .eq('id', msg.id);
        }
      }

      return new Response(JSON.stringify({ success: true, data: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('patafundi-chat error:', err);
    return new Response(JSON.stringify({ success: false, error: `Server error: ${err}` }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
