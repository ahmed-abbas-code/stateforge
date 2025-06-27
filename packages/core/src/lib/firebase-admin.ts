import { isDryRunEnv } from './isDryRunEnv';
import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type * as adminType from 'firebase-admin';

let adminAuth: Auth;
let firebaseAdmin: typeof adminType;

if (isDryRunEnv) {
  console.log('[DryRunMode] Skipping Firebase Admin initialization');

  // Stub adminAuth to prevent crashes in dry run mode
  adminAuth = {
    verifyIdToken: async () => ({ uid: 'dryrun-user' }),
  } as unknown as Auth;

  // Stub firebaseAdmin object if needed elsewhere
  firebaseAdmin = {} as typeof adminType;
} else {
  const { getApps, initializeApp, cert } = require('firebase-admin/app');
  const { getAuth } = require('firebase-admin/auth');
  const admin = require('firebase-admin');

  if (
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY ||
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  ) {
    throw new Error(
      'Missing Firebase Admin environment variables. Check FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, or NEXT_PUBLIC_FIREBASE_PROJECT_ID.'
    );
  }

  const adminApp: App =
    getApps().length === 0
      ? initializeApp({
          credential: cert({
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          }),
        })
      : getApps()[0];

  adminAuth = getAuth(adminApp);
  firebaseAdmin = admin;
}

export { adminAuth, firebaseAdmin };
