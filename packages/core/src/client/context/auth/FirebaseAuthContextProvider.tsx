// packages/core/src/context/auth/FirebaseAuthContextProvider.tsx

import React, { useEffect, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';

import { AuthContext } from './AuthContext';
import { AuthContextType, AuthUser } from '@core/common/types/Auth';
import { mapFirebaseToAuthUser } from '@core/common/index';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

export const FirebaseAuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
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
  }, []);

  const signIn = async (): Promise<{ ok: boolean; error?: string }> => {
    try {
      const auth = getAuth();
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
      const auth = getAuth();
      await firebaseSignOut(auth);
      setUser(null);
    } catch (e) {
      setError(e as Error);
    }
  };

  const getToken = async (): Promise<string | null> => {
    const auth = getAuth();
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };

  const contextValue: AuthContextType = {
    user,
    setUser,
    auth: getAuth(),
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
