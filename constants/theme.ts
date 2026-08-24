// PataFundi Unified Design System
// Single source of truth for all design tokens across Customer, Fundi, Admin, Staff

export const Colors = {
  // === BRAND CORE ===
  brand: {
    primary: '#0EA5E9',       // Sky blue — primary actions
    primaryDark: '#0284C7',
    primaryLight: '#38BDF8',
    secondary: '#F59E0B',     // Amber — highlights, CTAs
    secondaryDark: '#D97706',
    secondaryLight: '#FCD34D',
    accent: '#14B8A6',        // Teal — success, verified
    accentDark: '#0D9488',
  },

  // === BACKGROUNDS ===
  background: {
    primary: '#0A1628',       // Deep navy
    secondary: '#0F1E38',     // Slightly lighter navy
    tertiary: '#152342',      // Card backgrounds
    elevated: '#1A2F4E',      // Elevated surfaces
    overlay: 'rgba(10,22,40,0.85)',
  },

  // === GLASS SURFACES ===
  glass: {
    light: 'rgba(255,255,255,0.06)',
    medium: 'rgba(255,255,255,0.10)',
    heavy: 'rgba(255,255,255,0.15)',
    border: 'rgba(255,255,255,0.12)',
    borderLight: 'rgba(255,255,255,0.08)',
  },

  // === TEXT ===
  text: {
    primary: '#F0F6FF',
    secondary: '#94A3B8',
    tertiary: '#64748B',
    muted: '#475569',
    inverse: '#0A1628',
    link: '#38BDF8',
  },

  // === SEMANTIC ===
  semantic: {
    success: '#10B981',
    successBg: 'rgba(16,185,129,0.15)',
    warning: '#F59E0B',
    warningBg: 'rgba(245,158,11,0.15)',
    error: '#EF4444',
    errorBg: 'rgba(239,68,68,0.15)',
    info: '#3B82F6',
    infoBg: 'rgba(59,130,246,0.15)',
  },

  // === STATUS ===
  status: {
    online: '#10B981',
    offline: '#64748B',
    busy: '#F59E0B',
    pending: '#F59E0B',
    active: '#0EA5E9',
    completed: '#10B981',
    cancelled: '#EF4444',
    requested: '#8B5CF6',
    matched: '#0EA5E9',
    inProgress: '#F59E0B',
  },

  // === ROLE TINTS ===
  role: {
    customer: '#0EA5E9',
    fundi: '#14B8A6',
    admin: '#8B5CF6',
    staff: '#F59E0B',
  },

  // === GRADIENTS (as arrays for LinearGradient) ===
  gradients: {
    brand: ['#0EA5E9', '#0284C7'],
    amber: ['#F59E0B', '#D97706'],
    teal: ['#14B8A6', '#0D9488'],
    hero: ['#0A1628', '#1A2F4E'],
    success: ['#10B981', '#059669'],
    purple: ['#8B5CF6', '#7C3AED'],
    card: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)'],
    glass: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)'],
  },
};

export const Typography = {
  // Font sizes (based on 16px base, 1.25 scale)
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 22,
    '3xl': 26,
    '4xl': 32,
    '5xl': 40,
  },

  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
};

export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  brand: {
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  amber: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const Theme = { Colors, Typography, Spacing, Radius, Shadow };
export default Theme;
