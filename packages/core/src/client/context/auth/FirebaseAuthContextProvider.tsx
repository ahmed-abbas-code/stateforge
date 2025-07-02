// packages/core/src/context/auth/FirebaseAuthContextProvider.tsx

import React, { useEffect, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';

import { AuthContext } from './AuthContext';
import { AuthContextType, AuthUser } from '@core/common/types/Auth';
import { mapFirebaseToAuthUser } from '@core/common/index';
import { getRequiredEnv } from '../../../common/utils/getRequiredEnv';

let firebaseApp: FirebaseApp | null = null;

function getOrInitFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    if (typeof window !== 'undefined' && getApps().length > 0) {
      firebaseApp = getApps()[0];
    } else {
      firebaseApp = initializeApp({
        apiKey: getRequiredEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
        authDomain: getRequiredEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
        projectId: getRequiredEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
        storageBucket: getRequiredEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: getRequiredEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
        appId: getRequiredEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
      });
    }
  }
  return firebaseApp;
}

export const FirebaseAuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const app = getOrInitFirebaseApp();
      const auth = getAuth(app);

      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        try {
          setUser(firebaseUser ? mapFirebaseToAuthUser(firebaseUser) : null);
        } catch (e) {
          setError(e as Error);
        } finally {
          setIsLoading(false);
        }
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('[Firebase Init Error]', err);
      setError(err as Error);
      setIsLoading(false);
    }
  }, []);

  const signIn = async (): Promise<{ ok: boolean; error?: string }> => {
    try {
      const auth = getAuth(getOrInitFirebaseApp());
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { ok: true };
    } catch (e) {
      setError(e as Error);
      return { ok: false, error: (e as Error).message };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const auth = getAuth(getOrInitFirebaseApp());
      await firebaseSignOut(auth);
      setUser(null);
    } catch (e) {
      setError(e as Error);
    }
  };

  const getToken = async (): Promise<string | null> => {
    const auth = getAuth(getOrInitFirebaseApp());
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };

  const contextValue: AuthContextType = {
    user,
    setUser,
    auth: getAuth(getOrInitFirebaseApp()) as Auth,
    isLoading,
    error,
    isAuthenticated: !!user,
    signIn,
    signOut,
    getToken,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
