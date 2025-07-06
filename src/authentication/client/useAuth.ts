// src/authentication/client/useAuth.ts

import useSWR from 'swr';
import { AuthContextType, AuthUser } from '@authentication/auth/shared';

// SWR fetcher function
const fetchUser = async (): Promise<AuthUser | null> => {
  const res = await fetch('/api/auth/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // ensures cookies (HTTP-only) are sent
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user');
  }

  const { user } = await res.json();
  return user || null;
};

/**
 * Client-side hook to access authenticated user state
 */
export const useAuth = (): Omit<AuthContextType, 'signIn' | 'signOut' | 'getToken' | 'setUser'> => {
  const { data, error, isLoading } = useSWR<AuthUser | null>('/api/auth/me', fetchUser);

  return {
    user: data || null,
    isAuthenticated: !!data,
    isLoading,
    error: error ?? null,
  };
};
