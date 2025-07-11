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

/* -------------------------------------------------- */
/* helpers                                            */
/* -------------------------------------------------- */

// GET /api/auth/me  – swallow 401, log others
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

/* -------------------------------------------------- */
/* provider                                           */
/* -------------------------------------------------- */

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: AuthUserType;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  initialUser,
}) => (
  <SWRConfig
    value={{
      refreshInterval: 0,
      revalidateOnFocus: false,
      errorRetryCount: 0,
      onErrorRetry: () => { }, // no auto-retries for auth fetches
    }}
  >
    <InnerAuthProvider initialUser={initialUser}>
      {children}
    </InnerAuthProvider>
  </SWRConfig>
);

const InnerAuthProvider: React.FC<AuthProviderProps> = ({
  children,
  initialUser,
}) => {
  const router = useRouter();

  /* -------- swr: who-am-I ---------------------------------- */
  const {
    data: swrUser,
    error,
    isLoading,
  } = useSWR<AuthUserType | null>('/api/auth/me', fetchUser, {
    fallbackData: initialUser,
  });

  /* -------- local state ------------------------------------ */
  const [user, setUser] = useState<AuthUserType | null>(
    initialUser ?? null,
  );

  useEffect(() => {
    if (swrUser !== undefined && swrUser !== user) {
      setUser(swrUser);
    }
  }, [swrUser, user]);

  /* -------- token helpers ---------------------------------- */
  const getToken = useCallback(async (): Promise<string | null> => {
    // example: read HttpOnly cookie via backend or localStorage token
    const res = await fetch('/api/auth/token', {
      credentials: 'include',
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    return token ?? null;
  }, []);

  /* -------- sign-in / sign-out ----------------------------- */
  const signIn = useCallback(async () => {
    // implement your preferred auth flow here
    router.push('/signIn');
    return { ok: true };
  }, [router]);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => { });

    setUser(null);

    // ⬅️ Clear SWR cache for the auth endpoint
    mutate('/api/auth/me', null, false);

    router.push('/signIn');
  }, [router]);


  /* -------- global 401 interceptor ------------------------- */
  const handleResponse = useCallback(
    async (res: Response): Promise<Response> => {
      if (res.status === 401) {
        toast.info('Session expired. Please sign in again.');
        await signOut();
        throw new Error('Unauthorized');
      }
      return res;
    },
    [signOut],
  );

  /* -------- context value ---------------------------------- */
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

/* -------------------------------------------------- */
/* hook                                              */
/* -------------------------------------------------- */

export const useAuthContext = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
};
