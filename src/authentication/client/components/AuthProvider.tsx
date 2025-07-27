// src/authentication/client/components/AuthProvider.tsx

'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useRouter } from 'next/router';
import useSWR, { mutate, SWRConfig } from 'swr';
import { toast } from 'react-toastify';

import type { Session, AuthClientContext } from '@authentication/shared';

const SESSION_API_ENDPOINT = '/api/auth/context';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const fetchSessions = async (): Promise<Record<string, Session>> => {
  const res = await fetch(SESSION_API_ENDPOINT, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    if (res.status !== 401) {
      console.error(`Auth fetch failed: ${res.status} ${res.statusText}`);
    }
    return {};
  }

  const { sessions } = await res.json();
  return { ...sessions };
};

/* ------------------------------------------------------------------ */

const AuthContext = createContext<AuthClientContext | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  initialSessions?: Record<string, Session>;
  /** Limit “authenticated” checks to these instance IDs (optional) */
  instanceIds?: string[];
}

/* ------------------------------------------------------------------ */
/* Public wrapper                                                      */
/* ------------------------------------------------------------------ */

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  initialSessions = {},
  instanceIds,
}) => (
  <SWRConfig
    value={{
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnMount: true,          // ✅ now fetches on first render
      dedupingInterval: 5000,
      errorRetryCount: 0,
      onErrorRetry: () => {},
    }}
  >
    <InnerAuthProvider
      initialSessions={initialSessions}
      instanceIds={instanceIds}
    >
      {children}
    </InnerAuthProvider>
  </SWRConfig>
);

/* ------------------------------------------------------------------ */
/* Inner provider                                                      */
/* ------------------------------------------------------------------ */

const InnerAuthProvider: React.FC<AuthProviderProps> = ({
  children,
  initialSessions = {},
  instanceIds,
}) => {
  const router = useRouter();

  const {
    data: sessions = initialSessions,
    error,
    isLoading,
  } = useSWR<Record<string, Session>>(SESSION_API_ENDPOINT, fetchSessions, {
    fallbackData: initialSessions,
  });

  /* -------- auth state helpers ------------------------------------ */

  const isAuthenticated = useMemo(() => {
    const ids = instanceIds ?? Object.keys(sessions);
    return ids.some((id) => !!sessions[id]);
  }, [sessions, instanceIds]);

  /* -------- debug logging ----------------------------------------- */

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENV === 'development' && typeof window !== 'undefined') {
      console.log('[AuthProvider] sessions (by instanceId):', sessions);
      console.log('[AuthProvider] isAuthenticated:', isAuthenticated);
      console.log('[AuthProvider] error:', error);
    }
  }, [sessions, error, isAuthenticated]);

  /* -------- public helpers ---------------------------------------- */

  const getToken = useCallback(
    async (instanceId?: string): Promise<string | null> => {
      const id = instanceId ?? Object.keys(sessions)[0];
      if (!id) return null;

      const res = await fetch(`/api/auth/token?instanceId=${id}`, {
        credentials: 'include',
      });
      if (!res.ok) return null;
      const { token } = await res.json();
      return token ?? null;
    },
    [sessions]
  );

  const signIn = useCallback(
    async (
      idToken?: string,
      instanceId?: string
    ): Promise<{ ok: boolean; error?: string }> => {
      if (!idToken) return { ok: false, error: 'Missing ID token' };

      try {
        const res = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ idToken, instanceId }),
        });

        const body = await res.json();
        if (!res.ok || !body.ok) {
          return { ok: false, error: body?.error || 'Sign-in failed' };
        }

        await mutate(SESSION_API_ENDPOINT, undefined, { revalidate: true });
        return { ok: true };
      } catch (err) {
        console.error('[signIn] failed:', err);
        return { ok: false, error: 'Request failed' };
      }
    },
    []
  );

  const signOut = useCallback(
    async (providerIds?: string[]) => {
      try {
        await fetch('/api/auth/signout', {
          method: 'POST',
          credentials: 'include',
          body: providerIds ? JSON.stringify({ providerIds }) : undefined,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
        /* ignore */
      }

      mutate(SESSION_API_ENDPOINT, {}, false);
      router.push('/');
    },
    [router]
  );

  const handleResponse = useCallback(
    async (res: Response): Promise<Response> => {
      if (res.status === 401) {
        toast.info('Session expired. Please sign in again.');
        await signOut();
        throw new Error('Unauthorized');
      }
      return res;
    },
    [signOut]
  );

  /* -------- context value ---------------------------------------- */

  const contextValue: AuthClientContext = {
    sessions,
    setSessions: () => {}, // left as no-op for now
    isAuthenticated,
    isLoading,
    error: error ?? null,
    signIn,
    signOut,
    getToken,
    refreshToken: undefined,
    handleResponse,
    auth: undefined,
    handleRedirectCallback: undefined,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/* Hook export                                                         */
/* ------------------------------------------------------------------ */

export const useAuthContext = (): AuthClientContext => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
};
