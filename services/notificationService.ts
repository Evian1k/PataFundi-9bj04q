// PataFundi — Notification Service (real Supabase)
import { getSupabaseClient } from '@/template';
import { Notification, ApiResponse } from '@/types';

function mapNotif(n: any): Notification {
  return {
    id: n.id,
    userId: n.user_id,
    audience: n.audience,
    title: n.title,
    body: n.body,
    type: n.type,
    isRead: n.is_read,
    data: n.data,
    createdAt: n.created_at,
  };
}

export const notificationService = {
  async getNotifications(userId: string): Promise<ApiResponse<Notification[]>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('id, user_id, audience, title, body, type, is_read, data, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []).map(mapNotif) };
  },

  async markAsRead(notificationId: string): Promise<ApiResponse<boolean>> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: true };
  },

  async markAllAsRead(userId: string): Promise<ApiResponse<boolean>> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) return { success: false, error: error.message };
    return { success: true, data: true };
  },

  async getUnreadCount(userId: string): Promise<number> {
    const supabase = getSupabaseClient();
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    return count || 0;
  },

  // Real-time subscription — scoped to user only
  subscribeToNotifications(userId: string, onNotification: (n: Notification) => void) {
    const supabase = getSupabaseClient();
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => onNotification(mapNotif(payload.new)))
      .subscribe();
  },
};
