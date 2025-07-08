import { AuthContextType, AuthUser } from '@authentication/shared';
import React, { createContext, useContext, useState, useEffect } from 'react';
import useSWR from 'swr';
import { SWRConfig } from 'swr';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fetcher for /api/auth/me with 401 suppression
const fetchUser = async (): Promise<AuthUser | null> => {
  const res = await fetch('/api/auth/me', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status !== 401) {
      console.error(`Auth fetch failed: ${res.status} ${res.statusText}`);
    }
    return null;
  }

  const { user } = await res.json();
  return user || null;
};

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: AuthUser;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, initialUser }) => {
  return (
    <SWRConfig
      value={{
        refreshInterval: 0,
        revalidateOnFocus: false,
        errorRetryCount: 0,
        onErrorRetry: () => {},
      }}
    >
      <InnerAuthProvider initialUser={initialUser}>
        {children}
      </InnerAuthProvider>
    </SWRConfig>
  );
};

const InnerAuthProvider: React.FC<AuthProviderProps> = ({ children, initialUser }) => {
  const { data: userFromSWR, error, isLoading } = useSWR<AuthUser | null>(
    '/api/auth/me',
    fetchUser,
    { fallbackData: initialUser }
  );

  const [user, setUser] = useState<AuthUser | null>(initialUser ?? null);

  useEffect(() => {
    if (userFromSWR !== undefined && userFromSWR !== user) {
      setUser(userFromSWR);
    }
  }, [userFromSWR]);

  const contextValue: AuthContextType = {
    user,
    setUser,
    isAuthenticated: !!user,
    isLoading,
    error: error ?? null,
    signIn: async () => ({ ok: true }),
    signOut: async () => {},
    getToken: async () => null,
    // setUser provided above
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Hook for usage inside components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
