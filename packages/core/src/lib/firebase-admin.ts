import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as admin from 'firebase-admin';

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

export const adminAuth = getAuth(adminApp);

export const firebaseAdmin = admin;
