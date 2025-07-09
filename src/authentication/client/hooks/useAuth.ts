// src/authentication/client/hooks/useAuth.ts

import useSWR from 'swr';
import { AuthContextType, AuthUserType } from '@authentication/shared';

// SWR fetcher function with 401 suppression
const fetchUser = async (): Promise<AuthUserType | null> => {
  const res = await fetch('/api/auth/me', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    // only log unexpected errors
    if (res.status !== 401) {
      console.error(`Auth fetch failed: ${res.status} ${res.statusText}`);
    }
    return null; // suppress throwing to not break SWR hook
  }

  const { user } = await res.json();
  return (user as AuthUserType) || null;
};

/**
 * Client-side hook to access authenticated user state
 */
export const useAuth = (): Omit<AuthContextType, 'signIn' | 'signOut' | 'getToken' | 'setUser'> & { user: AuthUserType | null } => {
  const { data, error, isLoading } = useSWR<AuthUserType | null>('/api/auth/me', fetchUser, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    errorRetryCount: 0,
    onErrorRetry: () => {},
  });

  return {
    user: data || null,
    isAuthenticated: !!data,
    isLoading,
    error: error ?? null,
  };
};
