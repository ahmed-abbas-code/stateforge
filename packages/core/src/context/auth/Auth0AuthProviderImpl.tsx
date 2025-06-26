import React from 'react';
import { AuthContext } from './AuthContext';
import { useUser } from '@auth0/nextjs-auth0/client';

import type { AuthUser } from '../../types/Auth';
import { mapAuth0ToAuthUser } from './mappers/mapAuth0ToAuthUser';

export const Auth0AuthProviderImpl = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useUser();

  const login = async () => {
    window.location.href = '/api/auth/login';
  };

  const logout = async () => {
    window.location.href = '/api/auth/logout';
  };

  const getToken = async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/token');
      if (!res.ok) throw new Error('Token fetch failed');
      const { token } = await res.json();
      return token;
    } catch (err) {
      console.error('Failed to fetch token from Auth0:', err);
      return null;
    }
  };

  const mappedUser: AuthUser | null = user ? mapAuth0ToAuthUser(user) : null;

  return (
    <AuthContext.Provider
      value={{
        user: mappedUser,
        loading: isLoading,
        isAuthenticated: !!mappedUser,
        login,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
