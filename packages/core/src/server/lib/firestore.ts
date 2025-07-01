
import { getApps, getApp, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { env } from '../../common/utils/envConfig';
import { isDryRunEnv } from '@core/common/index';

let firestore: Firestore;

if (isDryRunEnv) {
  console.log('[DummyMode] Skipping Firestore initialization');

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
  const firebaseAdminConfig = {
    credential: cert({
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  };

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseAdminConfig);
  firestore = getFirestore(app);
}

export { firestore };
