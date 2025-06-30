// packages/core/src/context/auth/DummyAuthContextProvider.tsx

import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthUser, AuthContextType } from '@/types/Auth';

export const DummyAuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    const fakeUser: AuthUser = {
      uid: 'dummy-uid',
      email: 'dummy@dev.local',
      displayName: 'Dummy Developer',
      providerId: 'dummy',
    };

    setUser(fakeUser);
    setLoading(false);
  }, []);

  const login = async (): Promise<void> => {
    console.log('[DummyAuth] login triggered');
  };

  const logout = async (): Promise<void> => {
    console.log('[DummyAuth] logout triggered');
    setUser(null);
  };

  const getToken = async (): Promise<string | null> => {
    return 'dummy-token';
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    getToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
