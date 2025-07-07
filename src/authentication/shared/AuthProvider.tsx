// src/authentication/shared/AuthProvider.tsx

import { AuthContextType, AuthUser } from '@authentication/shared';
import React, { createContext, useContext, useState, useEffect } from 'react';
import useSWR from 'swr';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fetcher for /api/auth/me
const fetchUser = async (): Promise<AuthUser | null> => {
  const res = await fetch('/api/auth/me');
  if (!res.ok) return null;
  const { user } = await res.json();
  return user || null;
};

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: AuthUser;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, initialUser }) => {
  const { data: userFromSWR, isLoading } = useSWR<AuthUser | null>('/api/auth/me', fetchUser, {
    fallbackData: initialUser,
  });

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
    error: null, // Optional: Add error handling if desired
    signIn: async () => ({ ok: true }), // No-op, use useSignIn
    signOut: async () => {}, // No-op, use useSignOut
    getToken: async () => null, // Optional: implement a hook for token fetch
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
