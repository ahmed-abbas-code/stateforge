// packages/core/src/server/lib/firebase-admin.ts

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type * as adminType from 'firebase-admin';

import { getServerFrameworkConfig } from '@core/common/utils/getServerFrameworkConfig';
import { getServerEnvVar } from '@core/common/utils/getServerEnvVar';
import { getClientEnvVar } from '@core/common/utils';

const { isDryRun } = getServerFrameworkConfig();

let adminAuth: Auth;
let firebaseAdmin: typeof adminType;

if (isDryRun) {
  console.log('[DryRunMode] Skipping Firebase Admin initialization');

  adminAuth = {
    verifyIdToken: async () => ({ uid: 'dryrun-user' }),
  } as unknown as Auth;

  firebaseAdmin = {} as typeof adminType;
} else {
  const clientEmail = getServerEnvVar('FIREBASE_CLIENT_EMAIL');
  const privateKey = getServerEnvVar('FIREBASE_PRIVATE_KEY');
  const projectId = getClientEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID');

  const adminApp: App =
    getApps().length === 0
      ? initializeApp({
        credential: cert({
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
          projectId,
        }),
      })
      : getApps()[0];

  adminAuth = getAuth(adminApp);
  firebaseAdmin = admin;
}

export { adminAuth, firebaseAdmin };
