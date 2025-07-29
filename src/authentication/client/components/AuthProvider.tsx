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
import { formatSessionTTL } from '@authentication/shared/utils/formatSessionTTL';

const SESSION_API_ENDPOINT = '/api/auth/context?all=true';
const REFRESH_API_ENDPOINT = '/api/auth/refresh';

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
    <InnerAuthProvider instanceIds={instanceIds}>{children}</InnerAuthProvider>
  </SWRConfig>
);

const InnerAuthProvider: React.FC<AuthProviderProps> = ({ children, instanceIds }) => {
  const router = useRouter();
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const lastAuthState = useRef<boolean | undefined>(undefined);
  const isClient = typeof window !== 'undefined';

  const { data: sessions, error, isLoading } = useSWR<Record<string, Session>>(
    SESSION_API_ENDPOINT,
    fetchSessions
  );

  const resolvedSessions = sessions ?? {};

  const isAuthenticated = useMemo((): boolean | undefined => {
    if (isLoading) {
      if (isClient && process.env.NEXT_PUBLIC_ENV === 'development') {
        console.log('[AuthProvider:Decision] Still loading → deferring decision.');
      }
      return undefined;
    }

    if (!resolvedSessions || Object.keys(resolvedSessions).length === 0) {
      return false;
    }

    if (instanceIds && instanceIds.length > 0) {
      const missing = instanceIds.filter((id) => !resolvedSessions[id]);
      if (missing.length > 0) {
        if (isClient && process.env.NEXT_PUBLIC_ENV === 'development') {
          console.warn('[AuthProvider:Decision] Missing sessions for:', missing);
        }
        return false;
      }
    }

    return true;
  }, [resolvedSessions, instanceIds, isLoading, isClient]);

  // Debug logs
  useEffect(() => {
    if (isClient && process.env.NEXT_PUBLIC_ENV === 'development') {
      console.log(`[AuthProvider] Client time: ${new Date().toLocaleString()} (${Date.now()})`);
      for (const [id, session] of Object.entries(resolvedSessions)) {
        console.log(`[AuthProvider] Session for ${id}: ${formatSessionTTL(session.expiresAt)}`);
      }
    }
  }, [resolvedSessions, isClient]);

  useEffect(() => {
    if (isClient && lastAuthState.current !== isAuthenticated) {
      console.warn(`[AuthProvider] 🔁 isAuthenticated changed →`, isAuthenticated);
      lastAuthState.current = isAuthenticated;
    }
  }, [isAuthenticated, isClient]);

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

  const refreshToken = useCallback<
    AuthClientContext['refreshToken']
  >(async (providerIdOrIdToken, opts) => {
    try {
      const isIdToken = opts?.isIdToken === true;
      const body: Record<string, string> = {};

      if (isIdToken && providerIdOrIdToken) {
        body.idToken = providerIdOrIdToken;
      } else if (providerIdOrIdToken) {
        body.providerId = providerIdOrIdToken;
      }

      console.debug(
        `[AuthProvider] 🔄 Refresh triggered (${
          isIdToken ? 'idToken' : 'providerId'
        })`
      );

      const res = await fetch(REFRESH_API_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        console.warn(`[AuthProvider] Refresh failed:`, res.status);
        return null;
      }

      const { sessions } = await res.json();
      await mutate(SESSION_API_ENDPOINT, sessions, false);

      console.log('[AuthProvider] ✅ Refresh succeeded. Sessions updated:', sessions);
      return providerIdOrIdToken ?? null;
    } catch (err) {
      console.error('[AuthProvider] Refresh error:', err);
      return null;
    }
  }, []);

  const handleResponse = useCallback(
    async (res: Response) => {
      if (res.status !== 401) return res;
      console.warn('[AuthProvider] Got 401 → attempting refresh...');
      const refreshed = await refreshToken(undefined, { isIdToken: false });
      if (!refreshed) {
        console.warn('[AuthProvider] Refresh failed after 401 → signing out.');
        toast.info('Session expired. Please sign in again.');
        await signOut();
        throw new Error('Unauthorized');
      }
      return fetch(res.url, {
        method: res.type,
        headers: res.headers,
        credentials: 'include',
      });
    },
    [refreshToken, signOut]
  );

  // 🔹 Timer-based auto-refresh
  useEffect(() => {
    if (!isAuthenticated) {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
      return;
    }

    if (refreshTimer.current) clearInterval(refreshTimer.current);

    refreshTimer.current = setInterval(async () => {
      await refreshToken(undefined, { isIdToken: false });
    }, 60 * 1000);

    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [isAuthenticated, refreshToken]);

  const contextValue: AuthClientContext = {
    sessions: resolvedSessions,
    setSessions: () => {},
    isAuthenticated: isAuthenticated ?? false,
    isLoading,
    error: error ?? null,
    signIn: async () => ({ ok: false, error: 'Handled externally' }),
    signOut,
    getToken,
    refreshToken,
    handleResponse,
    auth: undefined,
    handleRedirectCallback: undefined,
    instanceIds,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// ✅ Safe SSR fallback for build-time
export const useAuthContext = (): AuthClientContext => {
  if (typeof window === 'undefined') {
    return {
      sessions: {},
      setSessions: () => {},
      isAuthenticated: false,
      isLoading: true,
      error: null,
      signIn: async () => ({ ok: false, error: 'SSR fallback' }),
      signOut: async () => {},
      getToken: async () => null,
      refreshToken: async () => null,
      handleResponse: async (res) => res,
      auth: undefined,
      handleRedirectCallback: undefined,
      instanceIds: [],
    };
  }

  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
};
