// PataFundi — Admin Service
// Real Supabase edge function integration
import { getSupabaseClient } from '@/template';
import { PlatformStats, PayrollPeriod, ApiResponse } from '@/types';
import { FunctionsHttpError } from '@supabase/supabase-js';

async function callAdmin<T>(body: object): Promise<ApiResponse<T>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('patafundi-admin', { body });
  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try { msg = await error.context.text(); } catch { /* ignore */ }
    }
    return { success: false, error: msg };
  }
  return data as ApiResponse<T>;
}

export const adminService = {
  async getPlatformStats(): Promise<ApiResponse<PlatformStats>> {
    return callAdmin<PlatformStats>({ action: 'platform_stats' });
  },

  async getPayroll(): Promise<ApiResponse<PayrollPeriod[]>> {
    const res = await callAdmin<any[]>({ action: 'get_payroll' });
    if (!res.success || !res.data) return res as ApiResponse<PayrollPeriod[]>;
    return {
      success: true,
      data: res.data.map(p => ({
        id: p.id,
        periodStart: p.period_start,
        periodEnd: p.period_end,
        totalStaff: p.total_staff,
        totalAmount: p.total_amount,
        status: p.status,
        approvedBy: p.approved_by,
        approvedAt: p.approved_at,
      })),
    };
  },

  async approvePayroll(payrollId: string): Promise<ApiResponse<{ auditId: string }>> {
    const res = await callAdmin<{ audit_id: string }>({ action: 'approve_payroll', payroll_id: payrollId });
    if (!res.success || !res.data) return res as ApiResponse<{ auditId: string }>;
    return { success: true, data: { auditId: res.data.audit_id }, message: res.message };
  },

  async getUsers(): Promise<ApiResponse<any[]>> {
    return callAdmin<any[]>({ action: 'get_users' });
  },

  async getDisputes(): Promise<ApiResponse<any[]>> {
    return callAdmin<any[]>({ action: 'get_disputes' });
  },

  async getAuditLogs(): Promise<ApiResponse<any[]>> {
    return callAdmin<any[]>({ action: 'get_audit_logs' });
  },

  async getSupportTickets(): Promise<ApiResponse<any[]>> {
    return callAdmin<any[]>({ action: 'support_tickets' });
  },

  async getDispatchOverview(): Promise<ApiResponse<{
    activeJobs: number; pendingMatching: number; onlineFundis: number; busyFundis: number; avgMatchTime: number;
  }>> {
    return callAdmin<any>({ action: 'dispatch_overview' });
  },
};
