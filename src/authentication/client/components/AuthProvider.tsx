// src/authentication/client/components/AuthProvider.tsx

'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useRouter } from 'next/router';
import useSWR, { mutate, SWRConfig } from 'swr';
import { toast } from 'react-toastify';

import type { Session, AuthClientContext } from '@authentication/shared';

const SESSION_API_ENDPOINT = '/api/auth/context';
const REFRESH_API_ENDPOINT = '/api/auth/refresh';
const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

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

const AuthContext = createContext<AuthClientContext | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  instanceIds?: string[];
}

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

const InnerAuthProvider: React.FC<AuthProviderProps> = ({
  children,
  instanceIds,
}) => {
  const router = useRouter();
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const lastAuthState = useRef<boolean>(false);

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

  const isExpiringSoon = (session?: Session, bufferMs = 2 * 60 * 1000) => {
    if (!session?.expiresAt) return false;
    return session.expiresAt - Date.now() < bufferMs;
  };

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      for (const [id, session] of Object.entries(resolvedSessions)) {
        const expires = session.expiresAt
          ? new Date(session.expiresAt).toLocaleString()
          : 'unknown';
        const ttl = session.expiresAt
          ? Math.round((session.expiresAt - Date.now()) / 1000)
          : 'unknown';
        console.log(`[AuthProvider] Session for ${id} expires at: ${expires} (in ${ttl}s)`);
      }
    }
  }, [resolvedSessions]);

  useEffect(() => {
    if (lastAuthState.current !== isAuthenticated) {
      console.warn(`[AuthProvider] 🔁 isAuthenticated changed → ${isAuthenticated}`);
      lastAuthState.current = isAuthenticated;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      console.log('[AuthProvider] sessions (by instanceId):', resolvedSessions);
      console.log('[AuthProvider] isAuthenticated:', isAuthenticated);
      if (error) console.error('[AuthProvider] error:', error);
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

  const refreshToken = useCallback(
    async (providerId?: string): Promise<string | null> => {
      try {
        const res = await fetch(REFRESH_API_ENDPOINT, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          console.warn('[refreshToken] Refresh failed:', res.status);
          return null;
        }

        const { sessions } = await res.json();
        await mutate(SESSION_API_ENDPOINT, sessions, false);

        const id = providerId ?? Object.keys(sessions)[0];
        return sessions?.[id]?.token ?? null;
      } catch (err) {
        console.error('[refreshToken] Error:', err);
        return null;
      }
    },
    []
  );

  const handleResponse = useCallback(
    async (res: Response): Promise<Response> => {
      if (res.status !== 401) return res;

      console.warn('[handleResponse] Got 401. Attempting refresh...');
      const refreshed = await refreshToken();

      if (!refreshed) {
        const activeIds = Object.keys(resolvedSessions);
        console.warn(
          `[handleResponse] Refresh failed — no sessions returned. Previous active providers: [${activeIds.join(', ')}]`
        );
        toast.info('Session expired. Please sign in again.');
        await signOut();
        throw new Error('Unauthorized');
      }

      const retry = await fetch(res.url, {
        method: res.type,
        headers: res.headers,
        credentials: 'include',
      });

      return retry;
    },
    [refreshToken, signOut, resolvedSessions]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
      return;
    }

    refreshTimer.current = setInterval(() => {
      console.debug('[AuthProvider] Checking for expiring sessions...');
      Object.entries(resolvedSessions).forEach(([providerId, session]) => {
        if (isExpiringSoon(session)) {
          console.debug(`[AuthProvider] Refreshing '${providerId}' before expiry`);
          refreshToken(providerId);
        }
      });
    }, 60 * 1000);

    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [isAuthenticated, refreshToken, resolvedSessions]);

  const contextValue: AuthClientContext = {
    sessions: resolvedSessions,
    setSessions: () => {},
    isAuthenticated,
    isLoading,
    error: error ?? null,
    signIn,
    signOut,
    getToken,
    refreshToken,
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
