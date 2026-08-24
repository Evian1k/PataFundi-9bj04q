// PataFundi App Configuration

export const APP_CONFIG = {
  name: 'PataFundi',
  version: '1.0.0',
  tagline: 'Trusted Professionals, On Demand',
  supportEmail: 'support@patafundi.com',
  emergencyPhone: '+254 800 123 456',
  currency: 'KES',
  currencySymbol: 'KSh',
  defaultCountry: 'KE',
  defaultCity: 'Nairobi',
};

export const SERVICE_CATEGORIES = [
  { id: 'plumbing', name: 'Plumbing', icon: 'water', color: '#0EA5E9' },
  { id: 'electrical', name: 'Electrical', icon: 'flash-on', color: '#F59E0B' },
  { id: 'carpentry', name: 'Carpentry', icon: 'handyman', color: '#92400E' },
  { id: 'painting', name: 'Painting', icon: 'format-color-fill', color: '#8B5CF6' },
  { id: 'cleaning', name: 'Cleaning', icon: 'cleaning-services', color: '#10B981' },
  { id: 'appliance', name: 'Appliance Repair', icon: 'home-repair-service', color: '#06B6D4' },
  { id: 'masonry', name: 'Masonry', icon: 'foundation', color: '#78716C' },
  { id: 'roofing', name: 'Roofing', icon: 'roofing', color: '#64748B' },
  { id: 'gardening', name: 'Gardening', icon: 'eco', color: '#16A34A' },
  { id: 'moving', name: 'Moving', icon: 'local-shipping', color: '#F97316' },
  { id: 'automotive', name: 'Automotive', icon: 'directions-car', color: '#EF4444' },
  { id: 'it', name: 'IT Services', icon: 'computer', color: '#3B82F6' },
];

export const JOB_URGENCY = [
  { id: 'emergency', label: 'Emergency', description: 'Within 1 hour', multiplier: 2.0, color: '#EF4444' },
  { id: 'urgent', label: 'Urgent', description: 'Within 4 hours', multiplier: 1.5, color: '#F59E0B' },
  { id: 'today', label: 'Today', description: 'Same day', multiplier: 1.2, color: '#0EA5E9' },
  { id: 'scheduled', label: 'Scheduled', description: 'Pick a date', multiplier: 1.0, color: '#10B981' },
];

export const JOB_STATUSES = {
  REQUESTED: 'requested',
  MATCHING: 'matching',
  FUNDI_ASSIGNED: 'fundi_assigned',
  FUNDI_ACCEPTED: 'fundi_accepted',
  ON_THE_WAY: 'on_the_way',
  ARRIVED: 'arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CUSTOMER_CONFIRMED: 'customer_confirmed',
  PAYMENT_PROCESSING: 'payment_processing',
  PAYMENT_COMPLETE: 'payment_complete',
  REVIEWED: 'reviewed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
} as const;

export const STAFF_ROLES = {
  OPERATIONS: 'operations',
  SUPPORT: 'support',
  FRAUD: 'fraud',
  FINANCE: 'finance',
  DISPATCH: 'dispatch',
  DEVOPS: 'devops',
  AUDITOR: 'auditor',
} as const;

export const USER_ROLES = {
  CUSTOMER: 'customer',
  FUNDI: 'fundi',
  STAFF: 'staff',
  SUPER_ADMIN: 'super_admin',
} as const;

// Pricing engine base rates (mock — backend will calculate authoritatively)
export const PRICING_CONFIG = {
  baseRates: {
    plumbing: { min: 1500, max: 5000 },
    electrical: { min: 2000, max: 8000 },
    carpentry: { min: 1800, max: 6000 },
    painting: { min: 2500, max: 15000 },
    cleaning: { min: 1200, max: 4000 },
    appliance: { min: 1500, max: 5000 },
    masonry: { min: 3000, max: 20000 },
    roofing: { min: 5000, max: 30000 },
    gardening: { min: 1000, max: 3500 },
    moving: { min: 3000, max: 15000 },
    automotive: { min: 2000, max: 10000 },
    it: { min: 1500, max: 8000 },
  },
  distanceRate: 50,       // KES per km
  travelBase: 200,        // Base travel fee
  platformFeeNote: 'Inclusive of all fees', // Never expose actual commission
};
