// Auth navigation redirect — handles login success routing
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export function useAuthRedirect() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    switch (user.role) {
      case 'customer': router.replace('/(customer)/(tabs)'); break;
      case 'fundi': router.replace('/(fundi)/(tabs)'); break;
      case 'super_admin': router.replace('/(admin)/(tabs)'); break;
      case 'staff': router.replace('/(staff)'); break;
    }
  }, [isAuthenticated, user]);
}
