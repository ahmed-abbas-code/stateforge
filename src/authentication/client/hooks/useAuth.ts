// src/authentication/client/hooks/useAuth.ts

'use client';

import useSWR from 'swr';
import { useAuthContext } from '../components/AuthProvider';
import type { AuthClientContext, AuthUserType, Session } from '@authentication/shared';

type MeResponse = {
  user: AuthUserType | null;
  sessions: Record<string, Session> | null;
};

// SWR fetcher for /api/auth/me
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

export const useAuth = (
  instanceIds?: string[]
): Omit<AuthClientContext, 'signIn' | 'signOut' | 'getToken'> & {
  user: AuthUserType | null;
  sessions: Record<string, Session>;
  setSessions: (sessions: Record<string, Session>) => void;
  revalidate: () => void;
  status: 'loading' | 'authenticated' | 'unauthenticated';
} => {
  const isClient = typeof window !== 'undefined';

  // ✅ Safe fallback when running in SSR
  const authCtx = isClient ? useAuthContext() : {
    refreshToken: async () => null,
  } as Pick<AuthClientContext, 'refreshToken'>;

  const { data, error, isLoading, mutate } = useSWR<MeResponse>(
    isClient ? '/api/auth/me' : null, // ✅ don’t fetch on server
    fetchSessions,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      errorRetryCount: 0,
      onErrorRetry: () => {},
    }
  );

  const sessions = data?.sessions ?? {};
  const user = data?.user ?? Object.values(sessions)[0]?.user ?? null;

  const isAuthenticated = (() => {
    if (!sessions || Object.keys(sessions).length === 0) return false;
    if (instanceIds && instanceIds.length > 0) {
      return instanceIds.every((id) => !!sessions[id]);
    }
    return Object.keys(sessions).some((id) => !!sessions[id]);
  })();

  const status: 'loading' | 'authenticated' | 'unauthenticated' =
    !isClient
      ? 'loading'
      : isLoading
      ? 'loading'
      : isAuthenticated
      ? 'authenticated'
      : 'unauthenticated';

  const setSessions = (nextSessions: Record<string, Session>) => {
    mutate({ user: data?.user ?? null, sessions: nextSessions }, false);
  };

  return {
    user,
    sessions,
    isAuthenticated,
    isLoading: !isClient || isLoading,
    error: error ?? null,
    status,
    setSessions,
    revalidate: () => mutate(),
    refreshToken: authCtx.refreshToken,
  };
};
