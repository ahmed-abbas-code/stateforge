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
/* Helpers                                                            */
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

  const data = await res.json();
  return structuredClone(data.sessions ?? {});
};

/* ------------------------------------------------------------------ */

const AuthContext = createContext<AuthClientContext | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  instanceIds?: string[];
}

/* ------------------------------------------------------------------ */
/* Public wrapper                                                     */
/* ------------------------------------------------------------------ */

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  instanceIds,
}) => (
  <SWRConfig
    value={{
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 5000,
      errorRetryCount: 0,
      onErrorRetry: () => {},
    }}
  >
    <InnerAuthProvider instanceIds={instanceIds}>
      {children}
    </InnerAuthProvider>
  </SWRConfig>
);

/* ------------------------------------------------------------------ */
/* Inner provider                                                     */
/* ------------------------------------------------------------------ */

const InnerAuthProvider: React.FC<AuthProviderProps> = ({
  children,
  instanceIds,
}) => {
  const router = useRouter();

  const {
    data: sessions,
    error,
    isLoading,
  } = useSWR<Record<string, Session>>(SESSION_API_ENDPOINT, fetchSessions);

  const resolvedSessions = sessions ?? {};

  const isAuthenticated = useMemo(() => {
    const ids = instanceIds ?? Object.keys(resolvedSessions);
    return ids.some((id) => !!resolvedSessions[id]);
  }, [resolvedSessions, instanceIds]);

  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_ENV === 'development' &&
      typeof window !== 'undefined'
    ) {
      console.log('[AuthProvider] sessions (by instanceId):', resolvedSessions);
      console.log('[AuthProvider] isAuthenticated:', isAuthenticated);
      console.log('[AuthProvider] error:', error);
    }
  }, [resolvedSessions, error, isAuthenticated]);

  const getToken = useCallback(
    async (instanceId?: string): Promise<string | null> => {
      const id = instanceId ?? Object.keys(resolvedSessions)[0];
      if (!id) return null;

      const res = await fetch(`/api/auth/token?instanceId=${id}`, {
        credentials: 'include',
      });
      if (!res.ok) return null;
      const { token } = await res.json();
      return token ?? null;
    },
    [resolvedSessions]
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

  const contextValue: AuthClientContext = {
    sessions: resolvedSessions,
    setSessions: () => {}, // noop
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
/* Hook export                                                        */
/* ------------------------------------------------------------------ */

export const useAuthContext = (): AuthClientContext => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
};
