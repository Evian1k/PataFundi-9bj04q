import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, StaffRole } from '@/types';
import { authService } from '@/services/authService';

interface AuthState {
  user: (User & { staffRole?: StaffRole }) | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User & { staffRole?: StaffRole }) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Simulate session check
    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, isLoading: false }));
    }, 500);
    return () => clearTimeout(timer);
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
    await authService.logout();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  };

  const setUser = (user: User & { staffRole?: StaffRole }) => {
    setState({ user, isLoading: false, isAuthenticated: true });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
