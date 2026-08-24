// PataFundi Fundi Service — Mock Implementation

import { Fundi, ApiResponse } from '@/types';

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_FUNDIS: Fundi[] = [
  {
    id: 'fundi_001',
    email: 'fundi@test.com',
    phone: '+254723456789',
    firstName: 'James',
    lastName: 'Omondi',
    role: 'fundi',
    isVerified: true,
    verificationStatus: 'verified',
    isOnline: true,
    rating: 4.8,
    totalJobs: 247,
    totalEarnings: 0,    // Not exposed to customers
    availableEarnings: 12450,
    pendingEarnings: 3200,
    skills: ['Pipe Installation', 'Leak Repair', 'Drain Clearing', 'Water Heater Installation'],
    serviceCategories: ['plumbing'],
    serviceAreas: ['Westlands', 'Parklands', 'Lavington', 'Kileleshwa'],
    bio: 'Certified plumber with 8 years of experience. Specializing in residential and commercial plumbing.',
    experienceYears: 8,
    portfolioImages: [],
    createdAt: '2023-03-15',
  },
  {
    id: 'fundi_002',
    email: 'peter@test.com',
    phone: '+254734567890',
    firstName: 'Peter',
    lastName: 'Kariuki',
    role: 'fundi',
    isVerified: true,
    verificationStatus: 'verified',
    isOnline: true,
    rating: 4.9,
    totalJobs: 312,
    totalEarnings: 0,
    availableEarnings: 0,
    pendingEarnings: 0,
    skills: ['Wiring', 'Socket Installation', 'Circuit Breakers', 'Lighting', 'Generators'],
    serviceCategories: ['electrical'],
    serviceAreas: ['CBD', 'Upperhill', 'South C', 'South B', 'Lang\'ata'],
    bio: 'Licensed electrician. 10 years in residential and commercial electrical work. Safety first.',
    experienceYears: 10,
    portfolioImages: [],
    createdAt: '2022-08-20',
  },
  {
    id: 'fundi_003',
    email: 'grace@test.com',
    phone: '+254745678901',
    firstName: 'Grace',
    lastName: 'Muthoni',
    role: 'fundi',
    isVerified: true,
    verificationStatus: 'verified',
    isOnline: false,
    rating: 4.7,
    totalJobs: 189,
    totalEarnings: 0,
    availableEarnings: 0,
    pendingEarnings: 0,
    skills: ['Deep Cleaning', 'Move-out Cleaning', 'Office Cleaning', 'Carpet Cleaning'],
    serviceCategories: ['cleaning'],
    serviceAreas: ['Karen', 'Langata', 'Kibera', 'Adams Arcade'],
    bio: 'Professional cleaning specialist. I bring thoroughness and attention to detail to every job.',
    experienceYears: 5,
    portfolioImages: [],
    createdAt: '2024-01-10',
  },
];

export const fundiService = {
  async getFundiById(fundiId: string): Promise<ApiResponse<Fundi>> {
    await simulateDelay(500);
    const fundi = MOCK_FUNDIS.find(f => f.id === fundiId);
    if (!fundi) return { success: false, error: 'Fundi not found.' };
    return { success: true, data: fundi };
  },

  async getAvailableFundis(serviceCategory: string): Promise<ApiResponse<Fundi[]>> {
    await simulateDelay(800);
    const fundis = MOCK_FUNDIS.filter(
      f => f.serviceCategories.includes(serviceCategory) && f.isOnline
    );
    return { success: true, data: fundis };
  },

  async getAllFundis(): Promise<ApiResponse<Fundi[]>> {
    await simulateDelay(800);
    return { success: true, data: MOCK_FUNDIS };
  },

  // Fundi toggles online status
  async toggleOnlineStatus(fundiId: string, isOnline: boolean): Promise<ApiResponse<boolean>> {
    await simulateDelay(600);
    const fundi = MOCK_FUNDIS.find(f => f.id === fundiId);
    if (fundi) fundi.isOnline = isOnline;
    return { success: true, data: isOnline };
  },

  // Fundi accepts/declines a job
  async respondToJob(jobId: string, fundiId: string, accept: boolean): Promise<ApiResponse<boolean>> {
    await simulateDelay(800);
    return { success: true, data: accept, message: accept ? 'Job accepted.' : 'Job declined.' };
  },

  // Mock: find nearest fundi for matching
  async matchFundi(serviceCategory: string, location: { latitude: number; longitude: number }): Promise<ApiResponse<Fundi>> {
    await simulateDelay(3000); // Simulate matching time
    const fundis = MOCK_FUNDIS.filter(
      f => f.serviceCategories.includes(serviceCategory) && f.isOnline
    );
    if (fundis.length === 0) return { success: false, error: 'No available Fundis at this time.' };
    return { success: true, data: fundis[0] };
  },

  async submitFundiApplication(data: Partial<Fundi> & { documents: string[] }): Promise<ApiResponse<{ applicationId: string }>> {
    await simulateDelay(2000);
    return {
      success: true,
      data: { applicationId: `app_${Date.now()}` },
      message: 'Application submitted! We will review and respond within 24 hours.',
    };
  },

  // Fundi earnings — only shows their eligible amount, not platform commission
  async getFundiEarnings(fundiId: string): Promise<ApiResponse<{
    available: number;
    pending: number;
    thisMonth: number;
    lastMonth: number;
    totalPaid: number;
  }>> {
    await simulateDelay(600);
    return {
      success: true,
      data: {
        available: 12450,
        pending: 3200,
        thisMonth: 28750,
        lastMonth: 31200,
        totalPaid: 184500,
      },
    };
  },
};
