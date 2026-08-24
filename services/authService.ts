// PataFundi Auth Service
// Mock implementation — replace with real API calls when backend is ready

import { User, UserRole, StaffRole, ApiResponse } from '@/types';

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

// Mock users for testing role isolation
const MOCK_USERS: Record<string, User & { password: string; staffRole?: StaffRole }> = {
  'customer@test.com': {
    id: 'cust_001',
    email: 'customer@test.com',
    phone: '+254712345678',
    firstName: 'Amina',
    lastName: 'Wanjiku',
    role: 'customer',
    isVerified: true,
    createdAt: '2025-01-01',
    password: '123456',
  },
  'fundi@test.com': {
    id: 'fundi_001',
    email: 'fundi@test.com',
    phone: '+254723456789',
    firstName: 'James',
    lastName: 'Omondi',
    role: 'fundi',
    isVerified: true,
    createdAt: '2025-01-01',
    password: '123456',
  },
  'admin@patafundi.com': {
    id: 'admin_001',
    email: 'admin@patafundi.com',
    phone: '+254700000001',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
    isVerified: true,
    createdAt: '2025-01-01',
    password: 'admin123',
  },
  'support@patafundi.com': {
    id: 'staff_001',
    email: 'support@patafundi.com',
    phone: '+254700000002',
    firstName: 'Sarah',
    lastName: 'Kimani',
    role: 'staff',
    isVerified: true,
    createdAt: '2025-01-01',
    password: '123456',
    staffRole: 'support',
  },
  'finance@patafundi.com': {
    id: 'staff_002',
    email: 'finance@patafundi.com',
    phone: '+254700000003',
    firstName: 'David',
    lastName: 'Mwangi',
    role: 'staff',
    isVerified: true,
    createdAt: '2025-01-01',
    password: '123456',
    staffRole: 'finance',
  },
  'fraud@patafundi.com': {
    id: 'staff_003',
    email: 'fraud@patafundi.com',
    phone: '+254700000004',
    firstName: 'Grace',
    lastName: 'Njoroge',
    role: 'staff',
    isVerified: true,
    createdAt: '2025-01-01',
    password: '123456',
    staffRole: 'fraud',
  },
};

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<User & { staffRole?: StaffRole }>> {
    await simulateDelay(1200);
    const identifier = credentials.email || credentials.phone || '';
    const user = MOCK_USERS[identifier];
    if (!user || user.password !== credentials.password) {
      return { success: false, error: 'Invalid credentials. Please try again.' };
    }
    const { password, ...safeUser } = user;
    return { success: true, data: safeUser };
  },

  async signup(data: SignupData): Promise<ApiResponse<User>> {
    await simulateDelay(1500);
    const newUser: User = {
      id: `user_${Date.now()}`,
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      isVerified: false,
      createdAt: new Date().toISOString(),
    };
    return { success: true, data: newUser, message: 'OTP sent to your phone.' };
  },

  async verifyOtp(otpData: OtpData): Promise<ApiResponse<boolean>> {
    await simulateDelay(1000);
    // Mock: any 6-digit OTP passes
    if (otpData.otp.length === 6 && /^\d+$/.test(otpData.otp)) {
      return { success: true, data: true, message: 'Phone verified successfully.' };
    }
    return { success: false, error: 'Invalid OTP. Please check and try again.' };
  },

  async forgotPassword(email: string): Promise<ApiResponse<boolean>> {
    await simulateDelay(1000);
    return { success: true, data: true, message: 'Password reset link sent to your email.' };
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<boolean>> {
    await simulateDelay(1000);
    return { success: true, data: true, message: 'Password reset successfully.' };
  },

  async logout(): Promise<ApiResponse<boolean>> {
    await simulateDelay(500);
    return { success: true, data: true };
  },

  async refreshSession(): Promise<ApiResponse<User>> {
    await simulateDelay(500);
    return { success: false, error: 'Session expired.' };
  },
};
