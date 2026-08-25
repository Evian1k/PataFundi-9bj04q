// PataFundi Chat Service — Real Supabase Implementation with real-time subscriptions
import { getSupabaseClient } from '@/template';
import { ChatRoom, ChatMessage, ApiResponse } from '@/types';
import { FunctionsHttpError } from '@supabase/supabase-js';

async function callChat<T>(body: object): Promise<ApiResponse<T>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('patafundi-chat', { body });
  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try { msg = await error.context.text(); } catch { /* ignore */ }
    }
    return { success: false, error: msg };
  }
  return data as ApiResponse<T>;
}

function mapMessage(m: any): ChatMessage {
  return {
    id: m.id,
    roomId: m.room_id,
    senderId: m.sender_id,
    senderRole: m.sender_role,
    type: m.type,
    content: m.content,
    imageUrl: m.image_url,
    readBy: m.read_by || [],
    createdAt: m.created_at,
  };
}

export const chatService = {
  async getChatRoom(jobId: string): Promise<ApiResponse<ChatRoom>> {
    const res = await callChat<any>({ action: 'get_room', job_id: jobId });
    if (!res.success || !res.data) return res as ApiResponse<ChatRoom>;
    return {
      success: true,
      data: {
        id: res.data.id,
        jobId: res.data.job_id,
        participants: [res.data.customer_id, res.data.fundi_id],
        updatedAt: res.data.updated_at,
      },
    };
  },

  async getMessages(roomId: string): Promise<ApiResponse<ChatMessage[]>> {
    const res = await callChat<any[]>({ action: 'get_messages', room_id: roomId });
    if (!res.success || !res.data) return res as ApiResponse<ChatMessage[]>;
    return { success: true, data: res.data.map(mapMessage) };
  },

  async sendMessage(params: {
    roomId: string;
    senderId: string;
    senderRole: 'customer' | 'fundi';
    type: 'text' | 'image';
    content: string;
    imageUrl?: string;
  }): Promise<ApiResponse<ChatMessage>> {
    const res = await callChat<any>({
      action: 'send_message',
      room_id: params.roomId,
      sender_role: params.senderRole,
      type: params.type,
      content: params.content,
      image_url: params.imageUrl,
    });
    if (!res.success || !res.data) return res as ApiResponse<ChatMessage>;
    return { success: true, data: mapMessage(res.data) };
  },

  async markAsRead(roomId: string, userId: string): Promise<ApiResponse<boolean>> {
    return callChat<boolean>({ action: 'mark_read', room_id: roomId });
  },

  // Real-time subscription for chat room messages — isolated to participants only
  subscribeToMessages(roomId: string, onMessage: (message: ChatMessage) => void) {
    const supabase = getSupabaseClient();
    return supabase
      .channel(`chat:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => onMessage(mapMessage(payload.new)))
      .subscribe();
  },
};
