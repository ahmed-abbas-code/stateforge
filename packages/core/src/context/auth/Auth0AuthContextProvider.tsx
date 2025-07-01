import React, { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

import { mapAuth0ToAuthUser } from './mappers/mapAuth0ToAuthUser';
import { AuthContext } from './AuthContext';
import type { AuthUser, AuthContextType } from '@/types/Auth';

export const Auth0AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: auth0User, isLoading } = useUser();
  const [error, setError] = useState<Error | null>(null);

  const logout = async (): Promise<void> => {
    try {
      window.location.href = '/api/auth/logout';
    } catch (err) {
      setError(err as Error);
    }
  };

  const getToken = async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/token');
      if (!res.ok) throw new Error('Token fetch failed');
      const { token } = await res.json();
      return token;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  };

  const mappedUser: AuthUser | null = auth0User ? mapAuth0ToAuthUser(auth0User) : null;

  const contextValue: AuthContextType = {
    user: mappedUser,
    isLoading,
    error,
    isAuthenticated: !!mappedUser,
    signOut: logout,
    getToken,
    // signIn is intentionally omitted for Auth0
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
