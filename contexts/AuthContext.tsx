// PataFundi AuthContext — Real Supabase session with role-based routing
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, StaffRole } from '@/types';
import { authService } from '@/services/authService';
import { getSupabaseClient } from '@/template';

interface AuthState {
  user: (User & { staffRole?: StaffRole }) | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User & { staffRole?: StaffRole }) => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Initial session check
    const initSession = async () => {
      const result = await authService.refreshSession();
      if (result.success && result.data) {
        setState({ user: result.data as User & { staffRole?: StaffRole }, isLoading: false, isAuthenticated: true });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initSession();

    // Listen for auth state changes (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const result = await authService.refreshSession();
        if (result.success && result.data) {
          setState({ user: result.data as User & { staffRole?: StaffRole }, isLoading: false, isAuthenticated: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login({ email, password });
    if (result.success && result.data) {
      setState({ user: result.data, isLoading: false, isAuthenticated: true });
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await authService.logout();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  };

  const setUser = (user: User & { staffRole?: StaffRole }) => {
    setState({ user, isLoading: false, isAuthenticated: true });
  };

  const refreshUser = async () => {
    const result = await authService.refreshSession();
    if (result.success && result.data) {
      setState({ user: result.data as User & { staffRole?: StaffRole }, isLoading: false, isAuthenticated: true });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
