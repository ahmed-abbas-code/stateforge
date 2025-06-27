import { isDryRunEnv } from './isDryRunEnv';
import type { Auth } from 'firebase/auth';

let auth: Auth;

if (isDryRunEnv) {
  console.log('[DummyMode] Skipping Firebase client initialization');

  auth = {
    currentUser: {
      uid: 'dummy-uid',
      email: 'dummy@local.dev',
    },
    onAuthStateChanged: () => () => {},
    signInWithPopup: async () => {},
    signOut: async () => {},
  } as unknown as Auth;
} else {
  // ✅ Use require instead of await import
  const { initializeApp, getApps, getApp } = require('firebase/app');
  const { getAuth } = require('firebase/auth');

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  };

  const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
}

export { auth };
