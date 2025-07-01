import { useCallback } from 'react';
import { useAuth } from '../context/auth/AuthContext';

export interface SignInResult {
  ok: boolean;
  error?: string;
}

export function useAuth0AuthState() {
  const {
    user,
    isLoading,
    isAuthenticated,
    signOut,
    getToken,
  } = useAuth();

  const signIn = useCallback(async (): Promise<SignInResult> => {
    try {
      window.location.href = '/api/auth/login';
      return { ok: true }; // This will redirect before resolving.
    } catch (err: unknown) {
      return {
        ok: false,
        error: (err as Error).message || 'Auth0 login failed.',
      };
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
    getToken,
  };
}
