// src/authentication/shared/middleware/firebase-admin.ts

import { initializeApp, cert, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import * as admin from 'firebase-admin';
import type * as adminType from 'firebase-admin';
import { getServerEnvVar } from '@shared/shared/utils/server';

const FIREBASE_PROJECT_ID = getServerEnvVar('FIREBASE_PROJECT_ID');
const FIREBASE_CLIENT_EMAIL = getServerEnvVar('FIREBASE_CLIENT_EMAIL');
const FIREBASE_PRIVATE_KEY = getServerEnvVar('FIREBASE_PRIVATE_KEY');

const firebaseAdminApp: App =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      })
    : getApp();

const adminAuth: Auth = getAuth(firebaseAdminApp);
const firebaseAdmin: typeof adminType = admin;

export { adminAuth, firebaseAdmin, firebaseAdminApp };

