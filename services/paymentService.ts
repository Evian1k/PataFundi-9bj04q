// PataFundi Payment Service — Real Supabase Implementation
// CRITICAL: Commission calculations stay on the backend. Never expose internally.
import { getSupabaseClient } from '@/template';
import { Payment, FundiPayout, ApiResponse } from '@/types';
import { FunctionsHttpError } from '@supabase/supabase-js';

async function callPayments<T>(body: object): Promise<ApiResponse<T>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('patafundi-payments', { body });
  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try { msg = await error.context.text(); } catch { /* ignore */ }
    }
    return { success: false, error: msg };
  }
  return data as ApiResponse<T>;
}

export const paymentService = {
  async initiatePayment(params: {
    jobId: string;
    customerId: string;
    amount: number;
    method: 'mpesa' | 'card' | 'wallet';
    mpesaNumber?: string;
  }): Promise<ApiResponse<{ transactionId: string; status: string }>> {
    const res = await callPayments<{ transaction_id: string; status: string; reference: string }>({
      action: 'initiate_payment',
      job_id: params.jobId,
      amount: params.amount,
      method: params.method,
      mpesa_number: params.mpesaNumber,
    });
    if (!res.success || !res.data) return res as ApiResponse<{ transactionId: string; status: string }>;
    return {
      success: true,
      data: { transactionId: res.data.transaction_id, status: res.data.status },
      message: res.message,
    };
  },

  async confirmPayment(transactionId: string): Promise<ApiResponse<Payment>> {
    const res = await callPayments<any>({
      action: 'confirm_payment',
      transaction_id: transactionId,
    });
    if (!res.success || !res.data) return res as ApiResponse<Payment>;
    const p = res.data;
    return {
      success: true,
      data: {
        id: p.id,
        jobId: p.job_id,
        customerId: p.customer_id,
        fundiId: p.fundi_id,
        amount: p.amount,
        method: p.method,
        status: p.status,
        reference: p.reference,
        createdAt: p.created_at,
        completedAt: p.completed_at,
      },
    };
  },

  async getCustomerPaymentHistory(customerId: string): Promise<ApiResponse<Payment[]>> {
    const res = await callPayments<any[]>({ action: 'get_history' });
    if (!res.success || !res.data) return res as ApiResponse<Payment[]>;
    return {
      success: true,
      data: res.data.map(p => ({
        id: p.id,
        jobId: p.job_id,
        customerId: p.customer_id || customerId,
        fundiId: p.fundi_id || '',
        amount: p.amount,
        method: p.method,
        status: p.status,
        reference: p.reference,
        createdAt: p.created_at,
        completedAt: p.completed_at,
      })),
    };
  },

  async requestFundiPayout(fundiId: string, amount: number): Promise<ApiResponse<FundiPayout>> {
    const res = await callPayments<any>({
      action: 'request_payout',
      amount,
    });
    if (!res.success || !res.data) return res as ApiResponse<FundiPayout>;
    const p = res.data;
    return {
      success: true,
      data: {
        id: p.id,
        fundiId: p.fundi_id,
        amount: p.amount,
        status: p.status,
        requestedAt: p.requested_at,
        processedAt: p.processed_at,
        bankDetails: {
          accountName: p.bank_account_name || '',
          accountNumber: p.bank_account_number || '',
          bankName: p.bank_name || '',
          mpesaNumber: p.mpesa_number,
        },
      },
      message: res.message,
    };
  },

  async getFundiPayoutHistory(fundiId: string): Promise<ApiResponse<FundiPayout[]>> {
    const res = await callPayments<any[]>({ action: 'get_payout_history' });
    if (!res.success || !res.data) return res as ApiResponse<FundiPayout[]>;
    return {
      success: true,
      data: res.data.map(p => ({
        id: p.id,
        fundiId: p.fundi_id || fundiId,
        amount: p.amount,
        status: p.status,
        requestedAt: p.requested_at,
        processedAt: p.processed_at,
        bankDetails: {
          accountName: p.bank_account_name || '',
          accountNumber: p.bank_account_number || '',
          bankName: p.bank_name || '',
          mpesaNumber: p.mpesa_number,
        },
      })),
    };
  },

  async submitDispute(params: {
    jobId: string;
    customerId: string;
    reason: string;
    description: string;
  }): Promise<ApiResponse<{ disputeId: string }>> {
    const res = await callPayments<{ dispute_id: string }>({
      action: 'submit_dispute',
      job_id: params.jobId,
      reason: params.reason,
      description: params.description,
    });
    if (!res.success || !res.data) return res as ApiResponse<{ disputeId: string }>;
    return { success: true, data: { disputeId: res.data.dispute_id }, message: res.message };
  },
};
