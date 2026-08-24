// PataFundi Payment Service — Mock Implementation
// IMPORTANT: Commission calculations are never exposed to customer or fundi

import { Payment, FundiPayout, ApiResponse } from '@/types';

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const paymentService = {
  async initiatePayment(params: {
    jobId: string;
    customerId: string;
    amount: number;
    method: 'mpesa' | 'card' | 'wallet';
    mpesaNumber?: string;
  }): Promise<ApiResponse<{ transactionId: string; status: string }>> {
    await simulateDelay(2000);
    return {
      success: true,
      data: { transactionId: `txn_${Date.now()}`, status: 'processing' },
      message: 'Payment initiated. Please confirm on your phone.',
    };
  },

  async confirmPayment(transactionId: string): Promise<ApiResponse<Payment>> {
    await simulateDelay(3000);
    const payment: Payment = {
      id: transactionId,
      jobId: 'job_001',
      customerId: 'cust_001',
      fundiId: 'fundi_001',
      amount: 4500,
      method: 'mpesa',
      status: 'completed',
      reference: `PF${Date.now()}`,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    return { success: true, data: payment };
  },

  async getCustomerPaymentHistory(customerId: string): Promise<ApiResponse<Payment[]>> {
    await simulateDelay(700);
    const payments: Payment[] = [
      {
        id: 'pay_001',
        jobId: 'job_002',
        customerId,
        fundiId: 'fundi_002',
        amount: 4000,
        method: 'mpesa',
        status: 'completed',
        reference: 'PF1706789012',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'pay_002',
        jobId: 'job_003',
        customerId,
        fundiId: 'fundi_003',
        amount: 2800,
        method: 'card',
        status: 'completed',
        reference: 'PF1706234567',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    return { success: true, data: payments };
  },

  async requestFundiPayout(fundiId: string, amount: number): Promise<ApiResponse<FundiPayout>> {
    await simulateDelay(1500);
    const payout: FundiPayout = {
      id: `payout_${Date.now()}`,
      fundiId,
      amount,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      bankDetails: { accountName: 'James Omondi', accountNumber: '0712345678', bankName: 'M-Pesa', mpesaNumber: '+254723456789' },
    };
    return { success: true, data: payout, message: 'Payout request submitted. Processing within 24 hours.' };
  },

  async getFundiPayoutHistory(fundiId: string): Promise<ApiResponse<FundiPayout[]>> {
    await simulateDelay(700);
    return {
      success: true,
      data: [
        {
          id: 'pout_001',
          fundiId,
          amount: 15000,
          status: 'paid',
          requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          processedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
          bankDetails: { accountName: 'James Omondi', accountNumber: '0712345678', bankName: 'M-Pesa' },
        },
      ],
    };
  },

  async submitDispute(params: { jobId: string; customerId: string; reason: string; description: string }): Promise<ApiResponse<{ disputeId: string }>> {
    await simulateDelay(1200);
    return {
      success: true,
      data: { disputeId: `disp_${Date.now()}` },
      message: 'Dispute submitted. Our team will review within 24 hours.',
    };
  },
};
