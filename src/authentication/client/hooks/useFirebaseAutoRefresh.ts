// src/authentication/client/hooks/useFirebaseAutoRefresh.ts

'use client';

import { useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { useAuthContext } from '../components/AuthProvider';

const FIREBASE_DEBOUNCE_MS = 30 * 1000;

export function useFirebaseAutoRefresh() {
  const { refreshToken, signOut } = useAuthContext();
  const lastRefresh = useRef(0);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) return;

    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (!user) return;

      const now = Date.now();
      if (now - lastRefresh.current < FIREBASE_DEBOUNCE_MS) return;

      try {
        const idToken = await user.getIdToken(true);
        await refreshToken(idToken, { isIdToken: true });
        lastRefresh.current = now;
      } catch (err) {
        console.error('[FirebaseAutoRefresh] Failed:', err);
        await signOut();
      }
    });

    return () => unsubscribe();
  }, [refreshToken, signOut]);
}
