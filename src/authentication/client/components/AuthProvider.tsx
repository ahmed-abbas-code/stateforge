// src/authentication/client/components/AuthProvider.tsx
'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  startTransition,
} from 'react';
import { useRouter } from 'next/router';
import useSWR, { mutate, SWRConfig } from 'swr';
import { toast } from 'react-toastify';
import type { Session, AuthClientContext } from '@authentication/shared';
import { formatSessionTTL } from '@authentication/shared';

const SESSION_API_ENDPOINT = '/api/auth/context?all=true';
const REFRESH_API_ENDPOINT = '/api/auth/refresh';

/* Fetcher: unified context + sessions */
const fetchContext = async (): Promise<{
  sessions: Record<string, Session>;
  context: any;
}> => {
  const res = await fetch(SESSION_API_ENDPOINT, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    if (res.status !== 401) {
      console.error(`[AuthProvider] fetchContext failed: ${res.status} ${res.statusText}`);
    }
    return { sessions: {}, context: null };
  }

  const data = await res.json();
  const unifiedSessions = data.sessions ?? data.context?.sessions ?? {};
  const unifiedContext = {
    ...(data.context ?? {}),
    sessions: unifiedSessions,
  };

  return {
    sessions: structuredClone(unifiedSessions),
    context: unifiedContext,
  };
};

/* Context setup */
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
  const lastAuthState = useRef<boolean | undefined>(undefined);
  const isClient = typeof window !== 'undefined';

  const { data, error, isLoading } = useSWR(SESSION_API_ENDPOINT, fetchContext);
  const resolvedSessions = data?.sessions ?? {};
  const meta = data?.context ?? null;

  const isAuthenticated = useMemo(() => {
    if (isLoading) return undefined;
    if (Object.keys(resolvedSessions).length === 0) return false;
    if (instanceIds?.length) {
      return instanceIds.every((id) => !!resolvedSessions[id]);
    }
    return true;
  }, [resolvedSessions, instanceIds, isLoading]);

  useEffect(() => {
    if (isClient && process.env.NEXT_PUBLIC_ENV === 'development') {
      console.log(`[AuthProvider] Client time: ${new Date().toLocaleString()} (${Date.now()})`);
      Object.entries(resolvedSessions).forEach(([id, s]) =>
        console.log(`[AuthProvider] Session for ${id}: ${formatSessionTTL(s.expiresAt)}`)
      );
      if (meta) console.log('[AuthProvider] meta context:', meta);
    }
  }, [resolvedSessions, isClient, meta]);

  useEffect(() => {
    if (isClient && lastAuthState.current !== isAuthenticated) {
      console.warn('[AuthProvider] isAuthenticated →', isAuthenticated);
      lastAuthState.current = isAuthenticated;
    }
  }, [isAuthenticated, isClient]);

  /* Unified session updater */
  const setSessions = useCallback(
    async (next: Record<string, Session>) => {
      const unifiedMeta = { ...meta, sessions: next };

      startTransition(() => {
        mutate(SESSION_API_ENDPOINT, { sessions: next, context: unifiedMeta }, false);
        mutate('/api/auth/me', unifiedMeta, false);
      });

      if (process.env.NEXT_PUBLIC_ENV === 'development') {
        console.log('[AuthProvider] setSessions applied:', next);
      }
    },
    [meta]
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
        /* ignore network issues */
      }

      await setSessions({});
      router.push('/');
    },
    [router, setSessions]
  );

  const refreshToken = useCallback<AuthClientContext['refreshToken']>(
    async (providerIdOrIdToken, opts) => {
      const body: Record<string, string> = {};
      if (opts?.isIdToken && providerIdOrIdToken) {
        body.idToken = providerIdOrIdToken;
      } else if (providerIdOrIdToken) {
        body.providerId = providerIdOrIdToken;
      }

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

      const { sessions: newSessions, context: newMeta } = await res.json();
      await setSessions(newSessions);

      if (process.env.NEXT_PUBLIC_ENV === 'development') {
        console.log('[AuthProvider] refreshToken updated sessions:', newSessions);
      }

      if (opts?.isIdToken && body.idToken) {
        return body.idToken;
      }
      if (providerIdOrIdToken && newSessions?.[providerIdOrIdToken]) {
        return newSessions[providerIdOrIdToken].token ?? null;
      }

      return null;
    },
    [setSessions]
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
      return fetch(res.url, {
        method: res.type,
        headers: res.headers,
        credentials: 'include',
      });
    },
    [refreshToken, signOut]
  );

  const ctx: AuthClientContext & { meta?: any } = {
    sessions: resolvedSessions,
    meta,
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

/* Hook export */
export const useAuthContext = (): AuthClientContext & { meta?: any } => {
  if (typeof window === 'undefined') {
    return {
      sessions: {},
      meta: null,
      setSessions: async () => {},
      isAuthenticated: false,
      isLoading: true,
      error: null,
      signIn: async () => ({ ok: false, error: 'SSR fallback' }),
      signOut: async () => {},
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
  return ctx as AuthClientContext & { meta?: any };
};
