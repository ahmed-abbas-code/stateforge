// packages/core/src/client/hooks/useFirebaseAuthState.ts
import { useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '../context/auth/AuthContext';
import { mapFirebaseToAuthUser } from '../../common/context/auth/mappers/mapFirebaseToAuthUser';

export interface FirebaseSignInResult {
  ok: boolean;
  error?: string;
}

export function useFirebaseAuthState() {
  const {
    user,
    isLoading,
    setUser,
    auth,
  } = useAuth();

  const signIn = useCallback(
    async (email: string, password: string): Promise<FirebaseSignInResult> => {
      if (!auth || !setUser) return { ok: false, error: 'Auth context not ready.' };

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser: User = userCredential.user;

        if (!firebaseUser.emailVerified) {
          return { ok: false, error: 'Please verify your email before signing in.' };
        }

        const mappedUser = mapFirebaseToAuthUser(firebaseUser);
        if (!mappedUser) {
          return { ok: false, error: 'Failed to map Firebase user.' };
        }

        setUser(mappedUser);
        return { ok: true };
      } catch (err: unknown) {
        const error = err as FirebaseError;
        return { ok: false, error: error.message || 'Sign-in failed' };
      }
    },
    [auth, setUser]
  );

  const signOut = useCallback(async () => {
    if (!auth || !setUser) return;

    try {
      await firebaseSignOut(auth);
    } finally {
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = '';
    }
  }, [auth, setUser]);

  return {
    user,
    isLoading,
    signIn,
    signOut,
  };
}
