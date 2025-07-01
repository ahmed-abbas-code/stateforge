import type { Auth, User } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { isDryRunEnv } from '@core/common/index';

let auth: Auth;

if (isDryRunEnv) {
  console.log('[DummyMode] Skipping Firebase client initialization');

  const dummyUser: Partial<User> = {
    uid: 'dummy-uid',
    email: 'dummy@local.dev',
  };

  auth = {
    currentUser: dummyUser as User,
    onAuthStateChanged: () => () => {},
    signInWithPopup: async () => {},
    signOut: async () => {},
  } as unknown as Auth;
} else {
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
