// PataFundi Notification Service — Real Supabase Implementation
// CRITICAL: Role isolation is enforced on BOTH frontend AND backend
import { getSupabaseClient } from '@/template';
import { Notification, NotificationAudience, ApiResponse } from '@/types';
import { FunctionsHttpError } from '@supabase/supabase-js';

async function callNotif<T>(body: object): Promise<ApiResponse<T>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('patafundi-notifications', { body });
  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try { msg = await error.context.text(); } catch { /* ignore */ }
    }
    return { success: false, error: msg };
  }
  return data as ApiResponse<T>;
}

function mapNotification(n: any, userId: string, audience: NotificationAudience): Notification {
  return {
    id: n.id,
    userId,
    audience,
    title: n.title,
    body: n.body,
    type: n.type,
    isRead: n.is_read,
    data: n.data,
    createdAt: n.created_at,
  };
}

export const notificationService = {
  // Role-isolated — backend verifies audience matches user role
  async getNotifications(userId: string, audience: NotificationAudience): Promise<ApiResponse<Notification[]>> {
    const res = await callNotif<any[]>({ action: 'get_notifications', audience });
    if (!res.success || !res.data) return { success: true, data: [] }; // Graceful empty
    return { success: true, data: res.data.map(n => mapNotification(n, userId, audience)) };
  },

  async markAsRead(notificationId: string, userId: string): Promise<ApiResponse<boolean>> {
    return callNotif<boolean>({ action: 'mark_read', notification_id: notificationId });
  },

  async markAllAsRead(userId: string, audience: NotificationAudience): Promise<ApiResponse<boolean>> {
    return callNotif<boolean>({ action: 'mark_all_read', audience });
  },

  async getUnreadCount(userId: string, audience: NotificationAudience): Promise<ApiResponse<number>> {
    const res = await callNotif<number>({ action: 'unread_count', audience });
    if (!res.success) return { success: true, data: 0 };
    return res;
  },

  // Real-time subscription — strictly filtered to this user only
  subscribeToNotifications(
    userId: string,
    audience: NotificationAudience,
    onNotification: (notification: Notification) => void
  ) {
    const supabase = getSupabaseClient();
    return supabase
      .channel(`notifications:${userId}:${audience}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const n = payload.new as any;
        // Double-check audience on frontend too (defense in depth)
        if (n.audience === audience) {
          onNotification(mapNotification(n, userId, audience));
        }
      })
      .subscribe();
  },
};
