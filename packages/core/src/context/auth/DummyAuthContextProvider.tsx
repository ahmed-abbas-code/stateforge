import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthUser, AuthContextType } from '@/types/Auth';

export const DummyAuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    const fakeUser: AuthUser = {
      uid: 'dummy-uid',
      email: 'dummy@dev.local',
      displayName: 'Dummy Developer',
      providerId: 'dummy',
    };

    setUser(fakeUser);
    setIsLoading(false);
  }, []);

  const signIn = async (): Promise<{ ok: boolean; error?: string }> => {
    console.log('[DummyAuth] signIn triggered');
    return { ok: true };
  };

  const signOut = async (): Promise<void> => {
    console.log('[DummyAuth] signOut triggered');
    setUser(null);
  };

  const getToken = async (): Promise<string | null> => {
    return 'dummy-token';
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signIn,
    signOut,
    getToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
