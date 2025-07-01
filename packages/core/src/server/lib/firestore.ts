import { getApps, getApp, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { config } from '@core/common/utils/configStore';
const isDryRun = config.isDryRun;

let firestore: Firestore;

if (isDryRun) {
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
  // 🔒 Ensure required vars exist
  if (!config.FIREBASE_PRIVATE_KEY || !config.FIREBASE_CLIENT_EMAIL || !config.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    throw new Error('[Firestore] Missing required Firebase Admin env variables');
  }

  const firebaseAdminConfig = {
    credential: cert({
      projectId: config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: config.FIREBASE_CLIENT_EMAIL,
      privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  };

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseAdminConfig);
  firestore = getFirestore(app);
}

export { firestore };
