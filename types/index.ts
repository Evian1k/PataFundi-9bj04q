// PataFundi — Shared TypeScript Types

// ==================== USER TYPES ====================

export type UserRole = 'customer' | 'fundi' | 'staff' | 'super_admin';
export type StaffRole = 'operations' | 'support' | 'fraud' | 'finance' | 'dispatch' | 'devops' | 'auditor';

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Customer extends User {
  role: 'customer';
  savedLocations: SavedLocation[];
  paymentMethods: PaymentMethod[];
  rating: number;
  totalJobs: number;
}

export interface Fundi extends User {
  role: 'fundi';
  skills: string[];
  serviceCategories: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended';
  isOnline: boolean;
  rating: number;
  totalJobs: number;
  totalEarnings: number;
  availableEarnings: number;
  pendingEarnings: number;
  serviceAreas: string[];
  bio: string;
  experienceYears: number;
  portfolioImages: string[];
  bankDetails?: BankDetails;
}

export interface StaffMember extends User {
  role: 'staff';
  staffRole: StaffRole;
  employeeId: string;
  department: string;
}

// ==================== LOCATION TYPES ====================

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  area?: string;
  city?: string;
}

export interface SavedLocation {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
}

// ==================== JOB TYPES ====================

export type JobStatus =
  | 'requested' | 'matching' | 'fundi_assigned' | 'fundi_accepted'
  | 'on_the_way' | 'arrived' | 'in_progress' | 'completed'
  | 'customer_confirmed' | 'payment_processing' | 'payment_complete'
  | 'reviewed' | 'cancelled' | 'disputed';

export type UrgencyLevel = 'emergency' | 'urgent' | 'today' | 'scheduled';

export interface Job {
  id: string;
  customerId: string;
  fundiId?: string;
  serviceCategory: string;
  title: string;
  description: string;
  photos: string[];
  location: Location;
  urgency: UrgencyLevel;
  scheduledAt?: string;
  status: JobStatus;
  estimatedPrice: PriceEstimate;
  agreedPrice?: number;
  finalPrice?: number;
  createdAt: string;
  updatedAt: string;
  timeline: JobTimelineEvent[];
  customer?: Partial<Customer>;
  fundi?: Partial<Fundi>;
}

export interface JobTimelineEvent {
  status: JobStatus;
  timestamp: string;
  note?: string;
}

export interface PriceEstimate {
  baseRate: number;
  distanceFee: number;
  travelFee: number;
  urgencyMultiplier: number;
  urgencyLabel: string;
  estimatedTotal: number;
  minTotal: number;
  maxTotal: number;
  note: string;   // e.g., "Inclusive of all fees"
}

// ==================== PAYMENT TYPES ====================

export type PaymentMethod = 'mpesa' | 'card' | 'wallet';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed';

export interface Payment {
  id: string;
  jobId: string;
  customerId: string;
  fundiId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  createdAt: string;
  completedAt?: string;
}

export interface FundiPayout {
  id: string;
  fundiId: string;
  amount: number;          // Fundi's eligible earnings (platform commission already deducted privately)
  status: 'pending' | 'processing' | 'paid' | 'failed';
  requestedAt: string;
  processedAt?: string;
  bankDetails: BankDetails;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  mpesaNumber?: string;
}

export interface SavedPaymentMethod {
  id: string;
  type: PaymentMethod;
  label: string;
  last4?: string;
  mpesaNumber?: string;
  isDefault: boolean;
}

// ==================== CHAT TYPES ====================

export interface ChatRoom {
  id: string;
  jobId: string;
  participants: string[];
  lastMessage?: ChatMessage;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderRole: UserRole;
  type: 'text' | 'image' | 'system';
  content: string;
  imageUrl?: string;
  readBy: string[];
  createdAt: string;
}

// ==================== NOTIFICATION TYPES ====================

export type NotificationAudience = 'customer' | 'fundi' | 'staff' | 'super_admin';

export interface Notification {
  id: string;
  userId: string;
  audience: NotificationAudience;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  data?: Record<string, string>;
  createdAt: string;
}

// ==================== ADMIN TYPES ====================

export interface PlatformStats {
  totalUsers: number;
  totalFundis: number;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;        // Super Admin only
  monthlyRevenue: number;      // Super Admin only
  averageJobValue: number;
  disputeRate: number;
}

export interface PayrollPeriod {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalStaff: number;
  totalAmount: number;
  status: 'open' | 'pending_approval' | 'approved' | 'paid';
  approvedBy?: string;
  approvedAt?: string;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}
