// PataFundi Fundi Service — Real Supabase Implementation
import { getSupabaseClient } from '@/template';
import { Fundi, ApiResponse } from '@/types';
import { FunctionsHttpError } from '@supabase/supabase-js';

async function callFundi<T>(body: object): Promise<ApiResponse<T>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('patafundi-fundi', { body });
  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try { msg = await error.context.text(); } catch { /* ignore */ }
    }
    return { success: false, error: msg };
  }
  return data as ApiResponse<T>;
}

async function callMatching<T>(body: object): Promise<ApiResponse<T>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('patafundi-matching', { body });
  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try { msg = await error.context.text(); } catch { /* ignore */ }
    }
    return { success: false, error: msg };
  }
  return data as ApiResponse<T>;
}

function mapFundiRow(row: any): Fundi {
  const up = row.user_profiles || {};
  return {
    id: row.id,
    email: up.email || '',
    phone: up.phone || '',
    firstName: up.first_name || '',
    lastName: up.last_name || '',
    role: 'fundi',
    avatarUrl: up.avatar_url,
    isVerified: row.verification_status === 'verified',
    verificationStatus: row.verification_status,
    isOnline: row.is_online,
    rating: row.rating || 0,
    totalJobs: row.total_jobs || 0,
    totalEarnings: 0,            // Never exposed
    availableEarnings: row.available_earnings || 0,
    pendingEarnings: row.pending_earnings || 0,
    skills: row.skills || [],
    serviceCategories: row.service_categories || [],
    serviceAreas: row.service_areas || [],
    bio: row.bio || '',
    experienceYears: row.experience_years || 0,
    portfolioImages: row.portfolio_images || [],
    createdAt: row.created_at || '',
    distanceKm: row.distance_km,
    etaMinutes: row.eta_minutes,
  } as Fundi;
}

export const fundiService = {
  async getFundiById(fundiId: string): Promise<ApiResponse<Fundi>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('fundi_profiles')
      .select(`
        id, skills, service_categories, service_areas, verification_status,
        is_online, rating, total_jobs, available_earnings, pending_earnings,
        bio, experience_years, portfolio_images,
        user_profiles!inner(id, first_name, last_name, phone, email, avatar_url)
      `)
      .eq('id', fundiId)
      .single();

    if (error || !data) return { success: false, error: 'Fundi not found.' };
    return { success: true, data: mapFundiRow(data) };
  },

  async getAvailableFundis(serviceCategory: string): Promise<ApiResponse<Fundi[]>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('fundi_profiles')
      .select(`
        id, skills, service_categories, service_areas, verification_status,
        is_online, rating, total_jobs, bio, experience_years,
        user_profiles!inner(id, first_name, last_name, avatar_url)
      `)
      .eq('is_online', true)
      .eq('verification_status', 'verified')
      .contains('service_categories', [serviceCategory]);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []).map(mapFundiRow) };
  },

  async getAllFundis(): Promise<ApiResponse<Fundi[]>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('fundi_profiles')
      .select(`
        id, skills, service_categories, service_areas, verification_status,
        is_online, rating, total_jobs, bio, experience_years,
        user_profiles!inner(id, first_name, last_name, avatar_url)
      `);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []).map(mapFundiRow) };
  },

  async toggleOnlineStatus(fundiId: string, isOnline: boolean, location?: { latitude: number; longitude: number }): Promise<ApiResponse<boolean>> {
    return callFundi<boolean>({
      action: 'toggle_online',
      is_online: isOnline,
      latitude: location?.latitude,
      longitude: location?.longitude,
    });
  },

  async updateLocation(latitude: number, longitude: number): Promise<ApiResponse<void>> {
    return callFundi<void>({ action: 'update_location', latitude, longitude });
  },

  async respondToJob(jobId: string, fundiId: string, accept: boolean): Promise<ApiResponse<boolean>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('patafundi-jobs', {
      body: { action: 'fundi_respond', job_id: jobId, accept },
    });
    if (error) return { success: false, error: error.message };
    return data as ApiResponse<boolean>;
  },

  async matchFundi(serviceCategory: string, location: { latitude: number; longitude: number }): Promise<ApiResponse<Fundi>> {
    const res = await callMatching<any>({
      action: 'find_fundis',
      service_category: serviceCategory,
      lat: location.latitude,
      lng: location.longitude,
    });
    if (!res.success || !res.data) return { success: false, error: 'No Fundis available at this time.' };
    return { success: true, data: mapFundiRow(res.data) };
  },

  async assignFundiToJob(jobId: string, fundiId: string): Promise<ApiResponse<void>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('patafundi-matching', {
      body: { action: 'assign_fundi', job_id: jobId, fundi_id: fundiId },
    });
    if (error) return { success: false, error: error.message };
    return data as ApiResponse<void>;
  },

  async submitFundiApplication(data: any): Promise<ApiResponse<{ applicationId: string }>> {
    const res = await callFundi<{ application_id: string }>({
      action: 'submit_application',
      skills: data.skills,
      service_categories: data.serviceCategories,
      service_areas: data.serviceAreas,
      bio: data.bio,
      experience_years: data.experienceYears,
    });
    if (!res.success || !res.data) return res as ApiResponse<{ applicationId: string }>;
    return { success: true, data: { applicationId: res.data.application_id }, message: res.message };
  },

  async getFundiEarnings(fundiId: string): Promise<ApiResponse<{
    available: number; pending: number; thisMonth: number; lastMonth: number; totalPaid: number;
  }>> {
    const res = await callFundi<any>({ action: 'get_earnings' });
    if (!res.success || !res.data) {
      // Fallback gracefully
      return { success: true, data: { available: 0, pending: 0, thisMonth: 0, lastMonth: 0, totalPaid: 0 } };
    }
    return res;
  },

  // Real-time: listen for fundi profile changes (online status, earnings)
  subscribeToFundiProfile(fundiId: string, onUpdate: (profile: any) => void) {
    const supabase = getSupabaseClient();
    return supabase
      .channel(`fundi_profile:${fundiId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'fundi_profiles',
        filter: `id=eq.${fundiId}`,
      }, (payload) => onUpdate(payload.new))
      .subscribe();
  },
};
