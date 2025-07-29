// src/authentication/client/hooks/useFirebaseAutoRefresh.ts

'use client';

import { useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { useAuthContext } from '../components/AuthProvider';

const FIREBASE_DEBOUNCE_MS = 30 * 1000;

export function useFirebaseAutoRefresh() {
  let refreshToken: ((token?: string, opts?: { isIdToken?: boolean }) => Promise<string | null>) | null = null;
  let signOut: (() => Promise<void>) | null = null;

  try {
    const ctx = useAuthContext();
    refreshToken = ctx.refreshToken;
    signOut = ctx.signOut;
  } catch {
    console.warn('[useFirebaseAutoRefresh] No AuthProvider found → skipping auto-refresh.');
    return; // exit early if not inside an AuthProvider
  }

  const lastRefresh = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !refreshToken || !signOut) return;

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
