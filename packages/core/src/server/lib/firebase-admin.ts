import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type * as adminType from 'firebase-admin';
import { isDryRunEnv } from '@core/common/index';

let adminAuth: Auth;
let firebaseAdmin: typeof adminType;

if (isDryRunEnv) {
  console.log('[DryRunMode] Skipping Firebase Admin initialization');

  adminAuth = {
    verifyIdToken: async () => ({ uid: 'dryrun-user' }),
  } as unknown as Auth;

  firebaseAdmin = {} as typeof adminType;
} else {
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
