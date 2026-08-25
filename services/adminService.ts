// PataFundi Admin Service — Real Supabase Implementation (Super Admin only)
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

  async getRevenueBreakdown(period: 'week' | 'month' | 'quarter' | 'year'): Promise<ApiResponse<{
    labels: string[]; revenue: number[]; jobs: number[]; payouts: number[];
  }>> {
    // Revenue breakdown requires a more complex query — using hardcoded trend for now
    // BACKEND REQUIRED: real time-series query
    return {
      success: true,
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        revenue: [185000, 220000, 195000, 248000, 312000, 389000, 275000],
        jobs: [44, 52, 48, 61, 78, 95, 67],
        payouts: [148000, 176000, 156000, 198400, 249600, 311200, 220000],
      },
    };
  },

  async getActiveJobsMap(): Promise<ApiResponse<Array<{ lat: number; lng: number; status: string; id: string }>>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('jobs')
      .select('id, lat, lng, status')
      .in('status', ['in_progress', 'on_the_way', 'arrived', 'matching']);

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      data: (data || []).map(j => ({ id: j.id, lat: j.lat, lng: j.lng, status: j.status })),
    };
  },

  async getPayrollPeriods(): Promise<ApiResponse<PayrollPeriod[]>> {
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

  async approvePayroll(params: {
    payrollId: string;
    adminId: string;
    passwordConfirmation: string;
    securityCode: string;
  }): Promise<ApiResponse<{ auditId: string }>> {
    const res = await callAdmin<{ audit_id: string }>({
      action: 'approve_payroll',
      payroll_id: params.payrollId,
    });
    if (!res.success || !res.data) return res as ApiResponse<{ auditId: string }>;
    return { success: true, data: { auditId: res.data.audit_id }, message: res.message };
  },

  async getDisputes(status?: string): Promise<ApiResponse<any[]>> {
    return callAdmin<any[]>({ action: 'get_disputes', status });
  },

  async getFraudAlerts(): Promise<ApiResponse<any[]>> {
    // BACKEND REQUIRED: fraud detection engine
    return {
      success: true,
      data: [
        { id: 'fraud_001', type: 'suspicious_transactions', entityId: 'fundi_089', severity: 'high', description: '7 rapid job completions in unusual pattern.', createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
        { id: 'fraud_002', type: 'multiple_accounts', entityId: 'cust_234', severity: 'medium', description: 'Account created from same device as banned account.', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      ],
    };
  },

  async getAuditLogs(limit = 50): Promise<ApiResponse<any[]>> {
    const res = await callAdmin<any[]>({ action: 'get_audit_logs' });
    return res;
  },
};
