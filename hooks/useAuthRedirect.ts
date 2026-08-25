// PataFundi Auth Redirect Hook — handles role-based navigation after auth state changes
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export function useAuthRedirect() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    const inCustomer = segments[0] === '(customer)';
    const inFundi = segments[0] === '(fundi)';
    const inAdmin = segments[0] === '(admin)';
    const inStaff = segments[0] === '(staff)';
    const inMarketing = segments[0] === 'marketing';
    const isRoot = segments[0] === undefined || segments[0] === 'index';

    if (!isAuthenticated) {
      // Allow marketing and onboarding without auth
      if (!inAuthGroup && !inOnboarding && !inMarketing) {
        router.replace('/onboarding');
      }
      return;
    }

    // User is authenticated — enforce role routing
    if (!user) return;

    const targetRoute = getRoleRoute(user.role);

    // If on auth/onboarding page and authenticated, redirect to role home
    if (inAuthGroup || inOnboarding || isRoot) {
      router.replace(targetRoute as any);
      return;
    }

    // Prevent cross-role access
    if (user.role === 'customer' && (inFundi || inAdmin || inStaff)) {
      router.replace('/(customer)/(tabs)' as any);
    } else if (user.role === 'fundi' && (inCustomer || inAdmin || inStaff)) {
      router.replace('/(fundi)/(tabs)' as any);
    } else if (user.role === 'super_admin' && (inCustomer || inFundi || inStaff)) {
      router.replace('/(admin)/(tabs)' as any);
    } else if (user.role === 'staff' && (inCustomer || inFundi || inAdmin)) {
      router.replace('/(staff)' as any);
    }
  }, [isLoading, isAuthenticated, user, segments]);
}

function getRoleRoute(role: string): string {
  switch (role) {
    case 'customer': return '/(customer)/(tabs)';
    case 'fundi': return '/(fundi)/(tabs)';
    case 'super_admin': return '/(admin)/(tabs)';
    case 'staff': return '/(staff)';
    default: return '/onboarding';
  }
}
