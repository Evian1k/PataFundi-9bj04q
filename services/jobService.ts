// PataFundi Job Service — Real Supabase Implementation
import { getSupabaseClient } from '@/template';
import { Job, JobStatus, UrgencyLevel, PriceEstimate, ApiResponse } from '@/types';
import { PRICING_CONFIG } from '@/constants/config';
import { FunctionsHttpError } from '@supabase/supabase-js';

async function callJobs<T>(body: object): Promise<ApiResponse<T>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('patafundi-jobs', { body });
  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try { msg = await error.context.text(); } catch { /* ignore */ }
    }
    return { success: false, error: msg };
  }
  return data as ApiResponse<T>;
}

// Map DB job row to frontend Job type
function mapJob(row: any): Job {
  return {
    id: row.id,
    customerId: row.customer_id,
    fundiId: row.fundi_id,
    serviceCategory: row.service_category,
    title: row.title,
    description: row.description,
    photos: row.photos || [],
    location: {
      latitude: row.lat,
      longitude: row.lng,
      address: row.address,
      area: row.area,
      city: row.city,
    },
    urgency: row.urgency,
    scheduledAt: row.scheduled_at,
    status: row.status,
    estimatedPrice: {
      baseRate: row.base_rate || 0,
      distanceFee: row.distance_fee || 0,
      travelFee: row.travel_fee || 0,
      urgencyMultiplier: row.urgency_multiplier || 1,
      urgencyLabel: row.urgency || '',
      estimatedTotal: row.estimated_total || 0,
      minTotal: row.min_total || 0,
      maxTotal: row.max_total || 0,
      note: PRICING_CONFIG.platformFeeNote,
    },
    agreedPrice: row.agreed_price,
    finalPrice: row.final_price,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    timeline: (row.job_timeline || []).map((t: any) => ({
      status: t.status,
      timestamp: t.created_at,
      note: t.note,
    })).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    customer: row.customer,
    fundi: row.fundi,
  };
}

export const jobService = {
  async getCustomerJobs(customerId: string): Promise<ApiResponse<Job[]>> {
    const res = await callJobs<any[]>({ action: 'get_customer_jobs' });
    if (!res.success || !res.data) return res as ApiResponse<Job[]>;
    return { success: true, data: res.data.map(mapJob) };
  },

  async getFundiJobs(fundiId: string): Promise<ApiResponse<Job[]>> {
    const res = await callJobs<any[]>({ action: 'get_fundi_jobs' });
    if (!res.success || !res.data) return res as ApiResponse<Job[]>;
    return { success: true, data: res.data.map(mapJob) };
  },

  async getJobById(jobId: string): Promise<ApiResponse<Job>> {
    const res = await callJobs<any>({ action: 'get_job', job_id: jobId });
    if (!res.success || !res.data) return res as ApiResponse<Job>;
    return { success: true, data: mapJob(res.data) };
  },

  async getAllJobs(): Promise<ApiResponse<Job[]>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('patafundi-admin', {
      body: { action: 'get_all_jobs' },
    });
    if (error) return { success: false, error: error.message };
    const res = data as ApiResponse<any[]>;
    if (!res.success || !res.data) return res as ApiResponse<Job[]>;
    return { success: true, data: res.data.map(mapJob) };
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
    const estimate = jobData.estimatedPrice;
    const res = await callJobs<any>({
      action: 'create_job',
      service_category: jobData.serviceCategory,
      title: jobData.title,
      description: jobData.description,
      photos: jobData.photos || [],
      lat: jobData.location?.latitude,
      lng: jobData.location?.longitude,
      address: jobData.location?.address,
      area: jobData.location?.area,
      city: jobData.location?.city,
      urgency: jobData.urgency,
      scheduled_at: jobData.scheduledAt,
      base_rate: estimate?.baseRate,
      distance_fee: estimate?.distanceFee,
      travel_fee: estimate?.travelFee,
      urgency_multiplier: estimate?.urgencyMultiplier,
      estimated_total: estimate?.estimatedTotal,
      min_total: estimate?.minTotal,
      max_total: estimate?.maxTotal,
    });
    if (!res.success || !res.data) return res as ApiResponse<Job>;
    return { success: true, data: mapJob(res.data) };
  },

  async updateJobStatus(jobId: string, status: JobStatus, note?: string): Promise<ApiResponse<Job>> {
    const res = await callJobs<any>({ action: 'update_status', job_id: jobId, status, note });
    if (!res.success || !res.data) return res as ApiResponse<Job>;
    return { success: true, data: mapJob(res.data) };
  },

  // Real-time subscription for a specific job
  subscribeToJob(jobId: string, onUpdate: (job: any) => void) {
    const supabase = getSupabaseClient();
    return supabase
      .channel(`job:${jobId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'jobs',
        filter: `id=eq.${jobId}`,
      }, (payload) => onUpdate(payload.new))
      .subscribe();
  },

  // Real-time subscription for job timeline
  subscribeToTimeline(jobId: string, onEvent: (event: any) => void) {
    const supabase = getSupabaseClient();
    return supabase
      .channel(`timeline:${jobId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'job_timeline',
        filter: `job_id=eq.${jobId}`,
      }, (payload) => onEvent(payload.new))
      .subscribe();
  },

  // Real-time: fundi listens for new jobs assigned to them
  subscribeToFundiJobs(fundiId: string, onNewJob: (job: any) => void) {
    const supabase = getSupabaseClient();
    return supabase
      .channel(`fundi_jobs:${fundiId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'jobs',
        filter: `fundi_id=eq.${fundiId}`,
      }, (payload) => onNewJob(payload.new))
      .subscribe();
  },
};
