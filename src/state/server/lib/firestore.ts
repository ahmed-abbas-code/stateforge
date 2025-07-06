// src/state/server/lib/firestore.ts

// import { getClientEnvVar, getServerEnvVar, getServerFrameworkConfig } from '@shared/shared/utils';
import { getClientEnvVar } from '@shared/shared/utils/client';
import { getServerEnvVar, getServerFrameworkConfig } from '@shared/shared/utils/server';
import { getApps, getApp, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

const { isDryRun } = getServerFrameworkConfig();

let firestore: Firestore;

if (isDryRun) {
  console.log('[DryRunMode] Skipping Firestore initialization');

  firestore = {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: false }),
        set: async () => {},
        update: async () => {},
        delete: async () => {},
      }),
    }),
  } as unknown as Firestore;
} else {
  const clientEmail = getServerEnvVar('FIREBASE_CLIENT_EMAIL');
  const privateKey = getServerEnvVar('FIREBASE_PRIVATE_KEY');
  const projectId = getClientEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID');

  const firebaseAdminConfig = {
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  };

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseAdminConfig);
  firestore = getFirestore(app);
}

export { firestore };
