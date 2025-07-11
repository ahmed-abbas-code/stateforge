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

import {
  AuthContextType,
  AuthUserType,
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
  return (user as AuthUserType) ?? null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: AuthUserType;
  redirectTo: string; // 👈 required param
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
    const res = await fetch('/api/auth/token', {
      credentials: 'include',
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    return token ?? null;
  }, []);

  const signIn = useCallback(async () => {
    router.push(redirectTo);
    return { ok: true };
  }, [router, redirectTo]);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});

    setUser(null);
    mutate('/api/auth/me', null, false);
    router.push(redirectTo);
  }, [router, redirectTo]);

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

  const contextValue: AuthContextType = {
    user,
    setUser,
    isAuthenticated: !!user,
    isLoading,
    error: error ?? null,
    signIn,
    signOut,
    getToken,
    handleResponse,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
};
