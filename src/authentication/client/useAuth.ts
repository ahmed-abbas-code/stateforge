import { AuthContextType, AuthUser } from '@authentication/shared';
import useSWR from 'swr';

// SWR fetcher function with 401 suppression
const fetchUser = async (): Promise<AuthUser | null> => {
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
    throw new Error(`Failed to fetch user: ${res.status}`);
  }

  const { user } = await res.json();
  return user || null;
};

/**
 * Client-side hook to access authenticated user state
 */
export const useAuth = (): Omit<AuthContextType, 'signIn' | 'signOut' | 'getToken' | 'setUser'> => {
  const { data, error, isLoading } = useSWR<AuthUser | null>('/api/auth/me', fetchUser, {
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
