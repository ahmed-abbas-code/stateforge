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
  return { ...sessions }; // ✅ ensure new object reference
};

const AuthContext = createContext<AuthClientContext | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  initialSessions?: Record<string, Session>;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  initialSessions = {},
}) => (
  <SWRConfig
    value={{
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnMount: false,
      dedupingInterval: 5000,
      errorRetryCount: 0,
      onErrorRetry: () => {},
    }}
  >
    <InnerAuthProvider initialSessions={initialSessions}>
      {children}
    </InnerAuthProvider>
  </SWRConfig>
);

const InnerAuthProvider: React.FC<AuthProviderProps> = ({
  children,
  initialSessions = {},
}) => {
  const router = useRouter();

  const {
    data: sessions = initialSessions,
    error,
    isLoading,
  } = useSWR<Record<string, Session>>(SESSION_API_ENDPOINT, fetchSessions, {
    fallbackData: initialSessions,
  });

  const isAuthenticated = useMemo(
    () => Object.keys(sessions).length > 0,
    [sessions]
  );

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'development' &&
      typeof window !== 'undefined' &&
      (Object.keys(sessions).length > 0 || !!error)
    ) {
      console.log('[AuthProvider] sessions:', sessions);
      console.log('[AuthProvider] isAuthenticated:', isAuthenticated);
      console.log('[AuthProvider] error:', error);
    }
  }, [sessions, error, isAuthenticated]);

  const getToken = useCallback(
    async (providerId?: string): Promise<string | null> => {
      const pid = providerId ?? Object.keys(sessions)[0];
      if (!pid) return null;

      const res = await fetch(`/api/auth/token?providerId=${pid}`, {
        credentials: 'include',
      });
      if (!res.ok) return null;
      const { token } = await res.json();
      return token ?? null;
    },
    [sessions]
  );

  const signIn = useCallback(
    async (idToken?: string): Promise<{ ok: boolean; error?: string }> => {
      if (!idToken) return { ok: false, error: 'Missing ID token' };

      try {
        const res = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ idToken }),
        });

        if (!res.ok) {
          const data = await res.json();
          return { ok: false, error: data?.error || 'Sign-in failed' };
        }

        // ✅ force update session state
        await mutate(SESSION_API_ENDPOINT);
        return { ok: true };
      } catch (err) {
        console.error('[signIn] /api/auth/signin failed:', err);
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
      } catch (_) {}

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
    sessions,
    setSessions: () => {},
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

export const useAuthContext = (): AuthClientContext => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
};
