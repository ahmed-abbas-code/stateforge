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

/* ------------------------------------------------------------------ */
/* Constants & helpers                                                */
/* ------------------------------------------------------------------ */
const SESSION_API_ENDPOINT = '/api/auth/context?all=true';
const REFRESH_API_ENDPOINT = '/api/auth/refresh';

const fetchSessions = async (): Promise<Record<string, Session>> => {
  const res = await fetch(SESSION_API_ENDPOINT, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    if (res.status !== 401) {
      console.error(`[AuthProvider] fetchSessions failed: ${res.status} ${res.statusText}`);
    }
    return {};
  }
  const data = await res.json();
  return structuredClone(data.sessions ?? {});
};

/* ------------------------------------------------------------------ */
/* Context setup                                                      */
/* ------------------------------------------------------------------ */
const AuthContext = createContext<AuthClientContext | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  instanceIds?: string[];
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, instanceIds }) => (
  <SWRConfig
    value={{
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 5_000,
      errorRetryCount: 0,
      onErrorRetry: () => { },
    }}
  >
    <InnerAuthProvider instanceIds={instanceIds}>{children}</InnerAuthProvider>
  </SWRConfig>
);

/* ------------------------------------------------------------------ */
/* Inner provider with real logic                                     */
/* ------------------------------------------------------------------ */
const InnerAuthProvider: React.FC<AuthProviderProps> = ({ children, instanceIds }) => {
  const router = useRouter();
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const lastAuthState = useRef<boolean | undefined>(undefined);
  const isClient = typeof window !== 'undefined';

  /* -----------------------------  SWR  ----------------------------- */
  const {
    data: sessions,
    error,
    isLoading,
  } = useSWR<Record<string, Session>>(SESSION_API_ENDPOINT, fetchSessions);

  const resolvedSessions = sessions ?? {};

  /* ---------------------------  derived  --------------------------- */
  const isAuthenticated = useMemo(() => {
    if (isLoading) return undefined;

    if (Object.keys(resolvedSessions).length === 0) return false;

    if (instanceIds?.length) {
      return instanceIds.every((id) => !!resolvedSessions[id]);
    }
    return true;
  }, [resolvedSessions, instanceIds, isLoading]);

  /* ---------------------------  logging  --------------------------- */
  useEffect(() => {
    if (isClient && process.env.NEXT_PUBLIC_ENV === 'development') {
      console.log(`[AuthProvider] Client time: ${new Date().toLocaleString()} (${Date.now()})`);
      Object.entries(resolvedSessions).forEach(([id, s]) =>
        console.log(`[AuthProvider] Session for ${id}: ${formatSessionTTL(s.expiresAt)}`),
      );
    }
  }, [resolvedSessions, isClient]);

  useEffect(() => {
    if (isClient && lastAuthState.current !== isAuthenticated) {
      console.warn('[AuthProvider] isAuthenticated →', isAuthenticated);
      lastAuthState.current = isAuthenticated;
    }
  }, [isAuthenticated, isClient]);

  /* ---------------------------  helpers  --------------------------- */
  const setSessions = useCallback(
    (next: Record<string, Session>) => {
      mutate(SESSION_API_ENDPOINT, next, false);
    },
    [],
  );

  const getToken = useCallback(
    async (instanceId?: string): Promise<string | null> => {
      const id = instanceId ?? Object.keys(resolvedSessions)[0];
      if (!id) return null;
      const res = await fetch(`/api/auth/token?instanceId=${id}`, { credentials: 'include' });
      if (!res.ok) return null;
      const { token } = await res.json();
      return token ?? null;
    },
    [resolvedSessions],
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
      } catch {/* ignore network issues */ }
      mutate(SESSION_API_ENDPOINT, {}, false);
      router.push('/');
    },
    [router],
  );

  const refreshToken = useCallback<AuthClientContext['refreshToken']>(
    async (providerIdOrIdToken, opts) => {
      const isIdToken = opts?.isIdToken === true;
      const body: Record<string, string> = {};

      if (isIdToken && providerIdOrIdToken) body.idToken = providerIdOrIdToken;
      else if (providerIdOrIdToken) body.providerId = providerIdOrIdToken;

      const res = await fetch(REFRESH_API_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: Object.keys(body).length ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        console.warn('[AuthProvider] refreshToken failed', res.status);
        return null;
      }

      const { sessions: newSessions } = await res.json();
      await mutate(SESSION_API_ENDPOINT, newSessions, false);
      return providerIdOrIdToken ?? null;
    },
    [],
  );

  const handleResponse = useCallback(
    async (res: Response) => {
      if (res.status !== 401) return res;
      const ok = await refreshToken(undefined, { isIdToken: false });
      if (!ok) {
        toast.info('Session expired. Please sign in again.');
        await signOut();
        throw new Error('Unauthorized');
      }
      return fetch(res.url, { method: res.type, headers: res.headers, credentials: 'include' });
    },
    [refreshToken, signOut],
  );

  /* -----------------------  timer auto-refresh  --------------------- */
  useEffect(() => {
    if (!isAuthenticated) {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
      return;                         // <-- ok: returns undefined
    }

    if (refreshTimer.current) clearInterval(refreshTimer.current);

    refreshTimer.current = setInterval(() => {
      refreshToken(undefined, { isIdToken: false });
    }, 60_000);

    // ✅ CLEAN-UP now returns void, never null
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [isAuthenticated, refreshToken]);

  /* -----------------------  context object  ------------------------ */
  const ctx: AuthClientContext = {
    sessions: resolvedSessions,
    setSessions,
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

  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>;
};

/* ------------------------------------------------------------------ */
/* useAuthContext – build-time safe fallback                           */
/* ------------------------------------------------------------------ */
export const useAuthContext = (): AuthClientContext => {
  if (typeof window === 'undefined') {
    // minimal no-op context for SSG / prerender builds
    return {
      sessions: {},
      setSessions: () => { },
      isAuthenticated: false,
      isLoading: true,
      error: null,
      signIn: async () => ({ ok: false, error: 'SSR fallback' }),
      signOut: async () => { },
      getToken: async () => null,
      refreshToken: async () => null,
      handleResponse: async (r) => r,
      auth: undefined,
      handleRedirectCallback: undefined,
      instanceIds: [],
    };
  }

  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider');
  return ctx;
};
