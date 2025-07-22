// src/authentication/client/hooks/useAuth.ts

import useSWR from 'swr';
import type { AuthClientContext, AuthUserType, Session } from '@authentication/shared';

type MeResponse = {
  user: AuthUserType | null;
  sessions: Record<string, Session> | null;
};

// SWR fetcher function with 401 suppression
const fetchUser = async (): Promise<MeResponse> => {
  const res = await fetch('/api/auth/me', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status !== 401) {
      console.error(`Auth fetch failed: ${res.status} ${res.statusText}`);
    }
    return { user: null, sessions: null };
  }

  return await res.json();
};

/**
 * Client-side hook to access authenticated user state
 */
export const useAuth = (): Omit<
  AuthClientContext,
  'signIn' | 'signOut' | 'getToken' | 'setUser'
> & {
  user: AuthUserType | null;
  sessions: Record<string, Session>;
  revalidate: () => void;
  status: 'loading' | 'authenticated' | 'unauthenticated';
} => {
  const { data, error, isLoading, mutate } = useSWR<MeResponse>('/api/auth/me', fetchUser, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    errorRetryCount: 0,
    onErrorRetry: () => {},
  });

  const isAuthenticated = !!data?.user;
  const status = isLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'unauthenticated';

  return {
    user: data?.user ?? null,
    sessions: data?.sessions ?? {},
    isAuthenticated,
    isLoading,
    error: error ?? null,
    status,
    revalidate: () => mutate(),
  };
};
