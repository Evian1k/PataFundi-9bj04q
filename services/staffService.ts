// PataFundi Staff Service — Role-restricted access

import { StaffRole, ApiResponse } from '@/types';

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Each staff role only accesses its permitted data
export const staffService = {
  // SUPPORT
  async getSupportTickets(status?: string): Promise<ApiResponse<Array<{
    id: string; customerId: string; jobId?: string; subject: string; status: string; priority: string; createdAt: string;
  }>>> {
    await simulateDelay(700);
    return {
      success: true,
      data: [
        { id: 'ticket_001', customerId: 'cust_234', jobId: 'job_034', subject: 'Fundi did not show up', status: 'open', priority: 'high', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: 'ticket_002', customerId: 'cust_456', subject: 'App not loading', status: 'in_progress', priority: 'medium', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
        { id: 'ticket_003', customerId: 'cust_789', jobId: 'job_028', subject: 'Payment dispute', status: 'escalated', priority: 'high', createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
      ],
    };
  },

  // FINANCE — payment operations visible to finance staff
  async getPaymentOperations(): Promise<ApiResponse<Array<{
    id: string; type: string; amount: number; status: string; jobId: string; createdAt: string;
  }>>> {
    await simulateDelay(700);
    return {
      success: true,
      data: [
        { id: 'pay_101', type: 'job_payment', amount: 4500, status: 'completed', jobId: 'job_001', createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
        { id: 'pay_102', type: 'fundi_payout', amount: 15000, status: 'processing', jobId: '', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
        { id: 'pay_103', type: 'refund', amount: 3200, status: 'pending', jobId: 'job_028', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
      ],
    };
  },

  // DISPATCH — active jobs and fundi availability
  async getDispatchOverview(): Promise<ApiResponse<{
    activeJobs: number;
    pendingMatching: number;
    onlineFundis: number;
    busyFundis: number;
    avgMatchTime: number;
  }>> {
    await simulateDelay(600);
    return {
      success: true,
      data: {
        activeJobs: 347,
        pendingMatching: 23,
        onlineFundis: 412,
        busyFundis: 324,
        avgMatchTime: 4.2,
      },
    };
  },

  // DEVOPS — system health
  async getSystemHealth(): Promise<ApiResponse<{
    api: { status: string; latency: number };
    db: { status: string; latency: number };
    payments: { status: string; latency: number };
    matching: { status: string; latency: number };
    chat: { status: string; latency: number };
    uptime: number;
  }>> {
    await simulateDelay(500);
    return {
      success: true,
      data: {
        api: { status: 'operational', latency: 45 },
        db: { status: 'operational', latency: 12 },
        payments: { status: 'operational', latency: 230 },
        matching: { status: 'operational', latency: 89 },
        chat: { status: 'operational', latency: 34 },
        uptime: 99.97,
      },
    };
  },

  // AUDITOR — read-only audit logs
  async getAuditReport(dateFrom: string, dateTo: string): Promise<ApiResponse<Array<{
    id: string; action: string; actorId: string; actorRole: string; details: string; timestamp: string;
  }>>> {
    await simulateDelay(900);
    return {
      success: true,
      data: [
        { id: 'audit_001', action: 'payroll_approved', actorId: 'admin_001', actorRole: 'super_admin', details: 'Payroll approved KSh 2,710,000', timestamp: '2026-08-01T09:15:00Z' },
        { id: 'audit_002', action: 'user_suspended', actorId: 'staff_003', actorRole: 'staff', details: 'Fundi fundi_089 suspended', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
        { id: 'audit_003', action: 'dispute_resolved', actorId: 'staff_001', actorRole: 'staff', details: 'Dispute disp_001 resolved. Refund approved.', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
      ],
    };
  },
};
