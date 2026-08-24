// PataFundi Job Service — Mock Implementation

import { Job, JobStatus, UrgencyLevel, PriceEstimate, ApiResponse } from '@/types';
import { PRICING_CONFIG } from '@/constants/config';

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_JOBS: Job[] = [
  {
    id: 'job_001',
    customerId: 'cust_001',
    fundiId: 'fundi_001',
    serviceCategory: 'plumbing',
    title: 'Kitchen Sink Leak',
    description: 'My kitchen sink has been leaking for 2 days. Water pooling under the cabinet.',
    photos: [],
    location: {
      latitude: -1.2921,
      longitude: 36.8219,
      address: '14 Riverside Drive, Westlands',
      area: 'Westlands',
      city: 'Nairobi',
    },
    urgency: 'urgent',
    status: 'in_progress',
    estimatedPrice: {
      baseRate: 2500,
      distanceFee: 150,
      travelFee: 200,
      urgencyMultiplier: 1.5,
      urgencyLabel: 'Urgent',
      estimatedTotal: 4275,
      minTotal: 3500,
      maxTotal: 6000,
      note: 'Inclusive of all fees',
    },
    agreedPrice: 4500,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      { status: 'requested', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { status: 'matching', timestamp: new Date(Date.now() - 115 * 60 * 1000).toISOString() },
      { status: 'fundi_assigned', timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString() },
      { status: 'fundi_accepted', timestamp: new Date(Date.now() - 100 * 60 * 1000).toISOString() },
      { status: 'on_the_way', timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString() },
      { status: 'arrived', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
      { status: 'in_progress', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    ],
    customer: { firstName: 'Amina', lastName: 'Wanjiku', phone: '+254712345678' },
    fundi: {
      firstName: 'James',
      lastName: 'Omondi',
      phone: '+254723456789',
      rating: 4.8,
      isVerified: true,
    },
  },
  {
    id: 'job_002',
    customerId: 'cust_001',
    serviceCategory: 'electrical',
    title: 'Faulty Power Sockets',
    description: 'Three power sockets in the living room stopped working after a power surge.',
    photos: [],
    location: {
      latitude: -1.2945,
      longitude: 36.8163,
      address: '14 Riverside Drive, Westlands',
      area: 'Westlands',
      city: 'Nairobi',
    },
    urgency: 'today',
    status: 'completed',
    estimatedPrice: {
      baseRate: 3000,
      distanceFee: 100,
      travelFee: 200,
      urgencyMultiplier: 1.2,
      urgencyLabel: 'Today',
      estimatedTotal: 3960,
      minTotal: 3000,
      maxTotal: 5000,
      note: 'Inclusive of all fees',
    },
    agreedPrice: 4000,
    finalPrice: 4000,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    timeline: [],
    customer: { firstName: 'Amina', lastName: 'Wanjiku' },
    fundi: { firstName: 'Peter', lastName: 'Kariuki', rating: 4.9, isVerified: true },
  },
];

export const jobService = {
  async getCustomerJobs(customerId: string): Promise<ApiResponse<Job[]>> {
    await simulateDelay(800);
    const jobs = MOCK_JOBS.filter(j => j.customerId === customerId);
    return { success: true, data: jobs };
  },

  async getFundiJobs(fundiId: string): Promise<ApiResponse<Job[]>> {
    await simulateDelay(800);
    const jobs = MOCK_JOBS.filter(j => j.fundiId === fundiId);
    return { success: true, data: jobs };
  },

  async getJobById(jobId: string): Promise<ApiResponse<Job>> {
    await simulateDelay(500);
    const job = MOCK_JOBS.find(j => j.id === jobId);
    if (!job) return { success: false, error: 'Job not found.' };
    return { success: true, data: job };
  },

  async getAllJobs(): Promise<ApiResponse<Job[]>> {
    await simulateDelay(800);
    return { success: true, data: MOCK_JOBS };
  },

  calculatePriceEstimate(
    serviceCategory: string,
    urgency: UrgencyLevel,
    distanceKm: number
  ): PriceEstimate {
    const key = serviceCategory as keyof typeof PRICING_CONFIG.baseRates;
    const rates = PRICING_CONFIG.baseRates[key] || { min: 1500, max: 5000 };
    const baseRate = (rates.min + rates.max) / 2;
    const distanceFee = Math.round(distanceKm * PRICING_CONFIG.distanceRate);
    const travelFee = PRICING_CONFIG.travelBase;

    const urgencyMap: Record<UrgencyLevel, { multiplier: number; label: string }> = {
      emergency: { multiplier: 2.0, label: 'Emergency' },
      urgent: { multiplier: 1.5, label: 'Urgent' },
      today: { multiplier: 1.2, label: 'Today' },
      scheduled: { multiplier: 1.0, label: 'Scheduled' },
    };
    const { multiplier, label } = urgencyMap[urgency];
    const estimatedTotal = Math.round((baseRate + distanceFee + travelFee) * multiplier);

    return {
      baseRate,
      distanceFee,
      travelFee,
      urgencyMultiplier: multiplier,
      urgencyLabel: label,
      estimatedTotal,
      minTotal: Math.round(rates.min * multiplier),
      maxTotal: Math.round(rates.max * multiplier * 1.3),
      note: PRICING_CONFIG.platformFeeNote,
    };
  },

  async createJob(jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    await simulateDelay(1500);
    const newJob: Job = {
      id: `job_${Date.now()}`,
      customerId: jobData.customerId || '',
      serviceCategory: jobData.serviceCategory || '',
      title: jobData.title || '',
      description: jobData.description || '',
      photos: jobData.photos || [],
      location: jobData.location || { latitude: 0, longitude: 0, address: '' },
      urgency: jobData.urgency || 'today',
      status: 'requested',
      estimatedPrice: jobData.estimatedPrice || { baseRate: 0, distanceFee: 0, travelFee: 0, urgencyMultiplier: 1, urgencyLabel: '', estimatedTotal: 0, minTotal: 0, maxTotal: 0, note: '' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [{ status: 'requested', timestamp: new Date().toISOString() }],
    };
    return { success: true, data: newJob };
  },

  async updateJobStatus(jobId: string, status: JobStatus): Promise<ApiResponse<Job>> {
    await simulateDelay(600);
    const job = MOCK_JOBS.find(j => j.id === jobId);
    if (!job) return { success: false, error: 'Job not found.' };
    job.status = status;
    job.timeline.push({ status, timestamp: new Date().toISOString() });
    return { success: true, data: job };
  },
};
