// packages/core/src/server/lib/firebase.ts

import type { Auth, User } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

import { getClientFrameworkConfig } from '@core/common/utils/getClientFrameworkConfig';
import { getClientEnvVar } from '@core/common/utils/getClientEnvVar';

const { NEXT_PUBLIC_AUTH_STRATEGY } = getClientFrameworkConfig();
const isDryRun = NEXT_PUBLIC_AUTH_STRATEGY === 'dryrun';

let auth: Auth;

if (isDryRun) {
  console.log('[DryRunMode] Skipping Firebase client initialization');

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
    apiKey: getClientEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: getClientEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: getClientEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: getClientEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getClientEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getClientEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID'),
  };

  const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
}

export { auth };
