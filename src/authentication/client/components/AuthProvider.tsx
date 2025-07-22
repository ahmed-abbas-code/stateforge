// src/authentication/client/components/AuthProvider.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/router';
import useSWR, { mutate, SWRConfig } from 'swr';
import { toast } from 'react-toastify';

import type {
  AuthUserType,
  AuthClientContext,
} from '@authentication/shared';

const fetchUser = async (): Promise<AuthUserType | null> => {
  const res = await fetch('/api/auth/me', {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    if (res.status !== 401) {
      console.error(`Auth fetch failed: ${res.status} ${res.statusText}`);
    }
    return null;
  }

  const { user } = await res.json();
  return user ?? null;
};

const AuthContext = createContext<AuthClientContext | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: AuthUserType;
  redirectTo: string;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  initialUser,
  redirectTo,
}) => (
  <SWRConfig
    value={{
      refreshInterval: 0,
      revalidateOnFocus: false,
      errorRetryCount: 0,
      onErrorRetry: () => {},
    }}
  >
    <InnerAuthProvider initialUser={initialUser} redirectTo={redirectTo}>
      {children}
    </InnerAuthProvider>
  </SWRConfig>
);

const InnerAuthProvider: React.FC<AuthProviderProps> = ({
  children,
  initialUser,
  redirectTo,
}) => {
  const router = useRouter();

  const {
    data: swrUser,
    error,
    isLoading,
  } = useSWR<AuthUserType | null>('/api/auth/me', fetchUser, {
    fallbackData: initialUser,
  });

  const [user, setUser] = useState<AuthUserType | null>(initialUser ?? null);

  useEffect(() => {
    if (swrUser !== undefined && swrUser !== user) {
      setUser(swrUser);
    }
  }, [swrUser, user]);

  const getToken = useCallback(async (): Promise<string | null> => {
    const res = await fetch('/api/auth/token', { credentials: 'include' });
    if (!res.ok) return null;
    const { token } = await res.json();
    return token ?? null;
  }, []);

  const signIn = useCallback(async () => {
    router.push(redirectTo);
    return { ok: true };
  }, [router, redirectTo]);

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (_) {}

    setUser(null);
    mutate('/api/auth/me', null, false);
    router.push(redirectTo);
  }, [router, redirectTo]);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Refresh failed: ${res.status}`);
      }

      const { user: refreshedUser, token } = await res.json();

      if (refreshedUser) {
        setUser(refreshedUser);
        mutate('/api/auth/me', refreshedUser, false);
      }

      return token ?? null;
    } catch (err) {
      console.error('Failed to refresh session', err);
      toast.info('Session expired. Please sign in again.');
      await signOut();
      return null;
    }
  }, [signOut]);

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

  // 🔁 Auto-refresh before session expiration
  useEffect(() => {
    if (!user?.expiresAt || !refreshToken) return;

    const now = Date.now();
    const refreshIn = user.expiresAt - now - 60_000; // Refresh 1 minute before expiry

    if (refreshIn <= 0) {
      refreshToken();
      return;
    }

    const timeoutId = setTimeout(() => {
      refreshToken();
    }, refreshIn);

    return () => clearTimeout(timeoutId);
  }, [user?.expiresAt, refreshToken]);

  const contextValue: AuthClientContext = {
    user,
    setUser,
    isAuthenticated: !!user,
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
