// PataFundi — Staff Service (real)
import { getSupabaseClient } from '@/template';
import { ApiResponse } from '@/types';

export const staffService = {
  async getSupportTickets(): Promise<ApiResponse<any[]>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('patafundi-admin', {
      body: { action: 'support_tickets' },
    });
    if (error) return { success: false, error: error.message };
    return data as ApiResponse<any[]>;
  },

  async getDispatchOverview(): Promise<ApiResponse<any>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('patafundi-admin', {
      body: { action: 'dispatch_overview' },
    });
    if (error) return { success: false, error: error.message };
    return data as ApiResponse<any>;
  },
};
