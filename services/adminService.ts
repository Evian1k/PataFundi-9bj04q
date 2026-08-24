// PataFundi Admin Service — SUPER ADMIN ONLY
// This service must NEVER be imported by customer or fundi screens

import { PlatformStats, PayrollPeriod, ApiResponse } from '@/types';

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const adminService = {
  // === PLATFORM OVERVIEW (Super Admin Only) ===
  async getPlatformStats(): Promise<ApiResponse<PlatformStats>> {
    await simulateDelay(800);
    return {
      success: true,
      data: {
        totalUsers: 14832,
        totalFundis: 2941,
        totalJobs: 89456,
        activeJobs: 347,
        completedJobs: 88102,
        totalRevenue: 48750000,      // Super Admin only — never expose to customers/fundis
        monthlyRevenue: 4875000,
        averageJobValue: 4250,
        disputeRate: 0.023,
      },
    };
  },

  async getRevenueBreakdown(period: 'week' | 'month' | 'quarter' | 'year'): Promise<ApiResponse<{
    labels: string[];
    revenue: number[];
    jobs: number[];
    payouts: number[];
  }>> {
    await simulateDelay(700);
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
    await simulateDelay(600);
    return {
      success: true,
      data: [
        { id: 'job_001', lat: -1.2921, lng: 36.8219, status: 'in_progress' },
        { id: 'job_002', lat: -1.2841, lng: 36.8155, status: 'on_the_way' },
        { id: 'job_003', lat: -1.3002, lng: 36.8334, status: 'matching' },
      ],
    };
  },

  // === PAYROLL (Super Admin Only) ===
  async getPayrollPeriods(): Promise<ApiResponse<PayrollPeriod[]>> {
    await simulateDelay(800);
    return {
      success: true,
      data: [
        {
          id: 'payroll_aug2026',
          periodStart: '2026-08-01',
          periodEnd: '2026-08-31',
          totalStaff: 47,
          totalAmount: 2840000,
          status: 'pending_approval',
        },
        {
          id: 'payroll_jul2026',
          periodStart: '2026-07-01',
          periodEnd: '2026-07-31',
          totalStaff: 45,
          totalAmount: 2710000,
          status: 'paid',
          approvedBy: 'admin_001',
          approvedAt: '2026-08-01T09:15:00Z',
        },
      ],
    };
  },

  async approvePayroll(params: {
    payrollId: string;
    adminId: string;
    passwordConfirmation: string;
    securityCode: string;
  }): Promise<ApiResponse<{ auditId: string }>> {
    await simulateDelay(2500);
    // IMPORTANT: Frontend validates, backend does the actual execution
    return {
      success: true,
      data: { auditId: `audit_${Date.now()}` },
      message: 'Payroll approved and queued for processing. Funds will be disbursed within 2 business hours.',
    };
  },

  // === DISPUTE MANAGEMENT ===
  async getDisputes(status?: string): Promise<ApiResponse<Array<{
    id: string; jobId: string; customerId: string; fundiId: string; reason: string; status: string; amount: number; createdAt: string;
  }>>> {
    await simulateDelay(600);
    return {
      success: true,
      data: [
        { id: 'disp_001', jobId: 'job_034', customerId: 'cust_089', fundiId: 'fundi_045', reason: 'Work not completed', status: 'open', amount: 6500, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: 'disp_002', jobId: 'job_028', customerId: 'cust_123', fundiId: 'fundi_078', reason: 'Quality issue', status: 'investigating', amount: 4200, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      ],
    };
  },

  // === FRAUD MANAGEMENT ===
  async getFraudAlerts(): Promise<ApiResponse<Array<{
    id: string; type: string; entityId: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string; createdAt: string;
  }>>> {
    await simulateDelay(700);
    return {
      success: true,
      data: [
        { id: 'fraud_001', type: 'suspicious_transactions', entityId: 'fundi_089', severity: 'high', description: '7 rapid job completions in unusual pattern.', createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
        { id: 'fraud_002', type: 'multiple_accounts', entityId: 'cust_234', severity: 'medium', description: 'Account created from same device as banned account.', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      ],
    };
  },

  async getAuditLogs(limit = 50): Promise<ApiResponse<Array<{
    id: string; action: string; actorId: string; actorRole: string; targetId?: string; details: string; timestamp: string; ip?: string;
  }>>> {
    await simulateDelay(800);
    return {
      success: true,
      data: [
        { id: 'audit_001', action: 'payroll_approved', actorId: 'admin_001', actorRole: 'super_admin', details: 'Payroll July 2026 approved. KSh 2,710,000.', timestamp: '2026-08-01T09:15:00Z', ip: '41.209.10.45' },
        { id: 'audit_002', action: 'user_suspended', actorId: 'staff_003', actorRole: 'staff', targetId: 'fundi_089', details: 'Fundi suspended pending fraud investigation.', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), ip: '41.209.10.12' },
      ],
    };
  },
};
