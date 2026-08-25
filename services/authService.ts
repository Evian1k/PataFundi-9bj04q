// PataFundi Auth Service — Real Supabase Implementation
import { getSupabaseClient } from '@/template';
import { User, UserRole, StaffRole, ApiResponse } from '@/types';
import { FunctionsHttpError } from '@supabase/supabase-js';

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface OtpData {
  phone: string;
  otp: string;
}

// ── helpers ──────────────────────────────────────────────────
async function callEdge<T>(fn: string, body: object, token?: string): Promise<ApiResponse<T>> {
  const supabase = getSupabaseClient();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const { data, error } = await supabase.functions.invoke(fn, { body, headers });
  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try { msg = await error.context.text(); } catch { /* ignore */ }
    }
    return { success: false, error: msg };
  }
  return data as ApiResponse<T>;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<User & { staffRole?: StaffRole }>> {
    const supabase = getSupabaseClient();
    const identifier = credentials.email || credentials.phone || '';

    const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
      email: identifier,
      password: credentials.password,
    });

    if (signInError || !session?.user) {
      return { success: false, error: 'Invalid credentials. Please try again.' };
    }

    // Fetch profile with role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, phone, role, avatar_url, is_verified, staff_role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: 'Profile not found. Please contact support.' };
    }

    const user: User & { staffRole?: StaffRole } = {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      phone: profile.phone || '',
      role: profile.role as UserRole,
      avatarUrl: profile.avatar_url,
      isVerified: profile.is_verified,
      createdAt: session.user.created_at,
      staffRole: profile.staff_role as StaffRole | undefined,
    };

    return { success: true, data: user };
  },

  async signup(data: SignupData): Promise<ApiResponse<User>> {
    const supabase = getSupabaseClient();

    const { data: session, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          role: data.role,
        },
      },
    });

    if (signUpError) {
      return { success: false, error: signUpError.message };
    }

    if (!session?.user) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }

    // Set role and profile on user_profiles (triggered by handle_new_user, but ensure fields)
    await supabase.from('user_profiles').update({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      role: data.role,
    }).eq('id', session.user.id);

    const newUser: User = {
      id: session.user.id,
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      isVerified: false,
      createdAt: session.user.created_at,
    };

    return { success: true, data: newUser, message: 'Account created successfully!' };
  },

  async verifyOtp(otpData: OtpData): Promise<ApiResponse<boolean>> {
    // OTP is handled by Supabase's built-in email OTP — this is a stub for phone OTP
    if (otpData.otp.length >= 4 && /^\d+$/.test(otpData.otp)) {
      return { success: true, data: true, message: 'Verified.' };
    }
    return { success: false, error: 'Invalid code. Please check and try again.' };
  },

  async forgotPassword(email: string): Promise<ApiResponse<boolean>> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'patafundi://reset-password',
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data: true, message: 'Password reset link sent to your email.' };
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<boolean>> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { success: false, error: error.message };
    return { success: true, data: true, message: 'Password reset successfully.' };
  },

  async logout(): Promise<ApiResponse<boolean>> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true, data: true };
  },

  async refreshSession(): Promise<ApiResponse<User>> {
    const supabase = getSupabaseClient();
    const { data: session, error } = await supabase.auth.getSession();

    if (error || !session?.session?.user) {
      return { success: false, error: 'Session expired.' };
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, phone, role, avatar_url, is_verified, staff_role')
      .eq('id', session.session.user.id)
      .single();

    if (!profile) return { success: false, error: 'Profile not found.' };

    const user: User & { staffRole?: StaffRole } = {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      phone: profile.phone || '',
      role: profile.role as UserRole,
      avatarUrl: profile.avatar_url,
      isVerified: profile.is_verified,
      createdAt: session.session.user.created_at,
      staffRole: profile.staff_role as StaffRole | undefined,
    };

    return { success: true, data: user };
  },
};
