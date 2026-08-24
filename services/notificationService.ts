// PataFundi Notification Service — Role-Isolated Mock Implementation
// CRITICAL: Notifications are strictly role-isolated. Never leak across roles.

import { Notification, NotificationAudience, ApiResponse } from '@/types';

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Role-isolated notification pools
const MOCK_NOTIFICATIONS: Record<NotificationAudience, Notification[]> = {
  customer: [
    {
      id: 'notif_c1',
      userId: 'cust_001',
      audience: 'customer',
      title: 'Fundi Assigned',
      body: 'James O. has been assigned to your plumbing job. He is on his way.',
      type: 'job_update',
      isRead: false,
      data: { jobId: 'job_001' },
      createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_c2',
      userId: 'cust_001',
      audience: 'customer',
      title: 'Work Complete',
      body: 'James has completed the work. Please confirm to release payment.',
      type: 'job_update',
      isRead: false,
      data: { jobId: 'job_001' },
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
  ],
  fundi: [
    {
      id: 'notif_f1',
      userId: 'fundi_001',
      audience: 'fundi',
      title: 'New Job Request',
      body: 'Plumbing job in Westlands. KSh 4,275 estimated. 2.3 km away.',
      type: 'incoming_job',
      isRead: false,
      data: { jobId: 'job_001' },
      createdAt: new Date(Date.now() - 115 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_f2',
      userId: 'fundi_001',
      audience: 'fundi',
      title: 'Payout Processed',
      body: 'KSh 15,000 has been sent to your M-Pesa.',
      type: 'payout',
      isRead: true,
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  staff: [
    {
      id: 'notif_s1',
      userId: 'staff_001',
      audience: 'staff',
      title: 'New Support Ticket',
      body: 'Customer #2847 has raised a dispute on Job #job_034.',
      type: 'support_ticket',
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ],
  super_admin: [
    {
      id: 'notif_a1',
      userId: 'admin_001',
      audience: 'super_admin',
      title: 'Monthly Payroll Ready',
      body: 'August 2026 payroll is ready for review and approval. 47 staff members. Total: KSh 2,840,000.',
      type: 'payroll',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_a2',
      userId: 'admin_001',
      audience: 'super_admin',
      title: 'Revenue Milestone',
      body: 'Platform reached KSh 10M monthly revenue milestone.',
      type: 'revenue',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_a3',
      userId: 'admin_001',
      audience: 'super_admin',
      title: 'Fraud Alert',
      body: 'Suspicious transaction pattern detected on account fundi_089. Review required.',
      type: 'fraud_alert',
      isRead: false,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
  ],
};

export const notificationService = {
  // Strictly role-isolated — only returns notifications for the given audience
  async getNotifications(userId: string, audience: NotificationAudience): Promise<ApiResponse<Notification[]>> {
    await simulateDelay(500);
    const notifications = MOCK_NOTIFICATIONS[audience].filter(n => n.userId === userId || n.audience === audience);
    return { success: true, data: notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) };
  },

  async markAsRead(notificationId: string, userId: string): Promise<ApiResponse<boolean>> {
    await simulateDelay(200);
    return { success: true, data: true };
  },

  async markAllAsRead(userId: string): Promise<ApiResponse<boolean>> {
    await simulateDelay(300);
    return { success: true, data: true };
  },

  async getUnreadCount(userId: string, audience: NotificationAudience): Promise<ApiResponse<number>> {
    await simulateDelay(200);
    const count = MOCK_NOTIFICATIONS[audience].filter(n => !n.isRead).length;
    return { success: true, data: count };
  },
};
