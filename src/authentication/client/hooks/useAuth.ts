// src/authentication/client/hooks/useAuth.ts

import useSWR from 'swr';
import type { AuthClientContext, AuthUserType, Session } from '@authentication/shared';

type MeResponse = {
  user: AuthUserType | null;
  sessions: Record<string, Session> | null;
};

// SWR fetcher function with 401 suppression
const fetchSessions = async (): Promise<MeResponse> => {
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
 * Client-side hook to access authenticated sessions state
 */
export const useAuth = (
  instanceIds?: string[]
): Omit<
  AuthClientContext,
  'signIn' | 'signOut' | 'getToken'
> & {
  user: AuthUserType | null;
  sessions: Record<string, Session>;
  setSessions: (sessions: Record<string, Session>) => void;
  revalidate: () => void;
  status: 'loading' | 'authenticated' | 'unauthenticated';
} => {
  const { data, error, isLoading, mutate } = useSWR<MeResponse>(
    '/api/auth/me',
    fetchSessions,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      errorRetryCount: 0,
      onErrorRetry: () => {},
    }
  );

  const sessions = data?.sessions ?? {};

  // ✅ Derive user as the first session’s user or explicit user from API
  const user =
    data?.user ??
    Object.values(sessions)[0]?.user ??
    null;

  // ✅ Updated authentication logic
  const isAuthenticated = (() => {
    if (!sessions || Object.keys(sessions).length === 0) return false;

    if (instanceIds && instanceIds.length > 0) {
      return instanceIds.every((id) => !!sessions[id]);
    }

    return Object.keys(sessions).some((id) => !!sessions[id]);
  })();

  const status: 'loading' | 'authenticated' | 'unauthenticated' =
    isLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'unauthenticated';

  // ✅ Setter that preserves user but updates sessions
  const setSessions = (nextSessions: Record<string, Session>) => {
    mutate(
      { user: data?.user ?? null, sessions: nextSessions },
      false
    );
  };

  return {
    user,
    sessions,
    isAuthenticated,
    isLoading,
    error: error ?? null,
    status,
    setSessions,
    revalidate: () => mutate(),
  };
};
