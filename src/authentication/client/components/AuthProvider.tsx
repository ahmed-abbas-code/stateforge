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

// Firebase client SDK
import { getAuth, onIdTokenChanged } from 'firebase/auth';

import type { Session, AuthClientContext } from '@authentication/shared';
import { formatSessionTTL } from '@authentication/shared/utils/formatSessionTTL';

const SESSION_API_ENDPOINT = '/api/auth/context?all=true';
const REFRESH_API_ENDPOINT = '/api/auth/refresh';
const FIREBASE_DEBOUNCE_MS = 30 * 1000; // 30s cooldown between refresh calls

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
  const lastFirebaseRefresh = useRef<number>(0);
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

  const isExpiringSoon = (session?: Session, bufferMs = 30 * 1000) => {
    if (!session?.expiresAt) return false;
    return session.expiresAt - Date.now() < bufferMs;
  };

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

  useEffect(() => {
    if (isClient && process.env.NEXT_PUBLIC_ENV === 'development') {
      console.log('[AuthProvider] sessions:', resolvedSessions);
      console.log('[AuthProvider] isAuthenticated:', isAuthenticated);
      if (error) console.error('[AuthProvider] error:', error);
    }
  }, [resolvedSessions, error, isAuthenticated, isClient]);

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

  const refreshToken = useCallback(async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const idToken = user ? await user.getIdToken(true) : null;

      const res = await fetch(REFRESH_API_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: idToken ? JSON.stringify({ idToken }) : undefined,
      });

      if (!res.ok) {
        console.warn('[refreshToken] Refresh failed:', res.status);
        return null;
      }

      const { sessions } = await res.json();
      await mutate(SESSION_API_ENDPOINT, sessions, false);

      console.log('[AuthProvider] ✅ Refresh executed. Sessions updated:', sessions);
      return sessions;
    } catch (err) {
      console.error('[refreshToken] Error:', err);
      return null;
    }
  }, []);

  const handleResponse = useCallback(
    async (res: Response) => {
      if (res.status !== 401) return res;
      console.warn('[handleResponse] Got 401. Attempting refresh...');
      const refreshed = await refreshToken();
      if (!refreshed) {
        console.warn('[handleResponse] Refresh failed — signing out.');
        toast.info('Session expired. Please sign in again.');
        await signOut();
        throw new Error('Unauthorized');
      }
      return fetch(res.url, { method: res.type, headers: res.headers, credentials: 'include' });
    },
    [refreshToken, signOut]
  );

  // 🔹 Firebase Auto Re-SignIn with debounce
  useEffect(() => {
    if (!isClient) return;
    const auth = getAuth();

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) return;

      const now = Date.now();
      if (now - lastFirebaseRefresh.current < FIREBASE_DEBOUNCE_MS) {
        console.debug('[AuthProvider] ⏳ Skipping Firebase refresh (debounced)');
        return;
      }
      lastFirebaseRefresh.current = now;

      try {
        await user.getIdToken(true); // ensures Firebase token is fresh
        console.debug('[AuthProvider] 🔄 Firebase ID token refreshed. Calling backend refresh...');
        await refreshToken(); // backend uses idToken if provided
      } catch (err) {
        console.error('[AuthProvider] Firebase auto re-signin failed:', err);
        await signOut();
      }
    });

    return () => unsubscribe();
  }, [isClient, refreshToken, signOut]);

  // 🔹 JWT auto-refresh with timer
  useEffect(() => {
    if (!isAuthenticated) {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
      return;
    }

    if (refreshTimer.current) clearInterval(refreshTimer.current);

    const bufferMs = 30 * 1000;
    refreshTimer.current = setInterval(async () => {
      const hasExpiring = Object.values(resolvedSessions).some((s) =>
        isExpiringSoon(s, bufferMs)
      );
      if (hasExpiring) {
        console.debug('[AuthProvider] 🔔 Expiring soon → triggering refresh');
        await refreshToken();
      } else {
        console.debug('[AuthProvider] ⏳ Checked sessions, none expiring yet');
      }
    }, 30 * 1000);

    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [isAuthenticated, refreshToken, resolvedSessions]);

  const contextValue: AuthClientContext = {
    sessions: resolvedSessions,
    setSessions: () => {},
    isAuthenticated: isAuthenticated ?? false,
    isLoading,
    error: error ?? null,
    signIn: async () => ({ ok: false, error: 'Disabled in client' }), // handled via Firebase + refresh
    signOut,
    getToken,
    refreshToken,
    handleResponse,
    auth: undefined,
    handleRedirectCallback: undefined,
    instanceIds,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthClientContext => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
};
