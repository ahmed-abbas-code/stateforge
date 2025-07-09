// src/state/server/lib/firestore.ts

import { getServerEnvVar } from '@shared/utils/server';
import { getApps, getApp, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

const clientEmail = getServerEnvVar('FIREBASE_CLIENT_EMAIL');
const privateKey = getServerEnvVar('FIREBASE_PRIVATE_KEY');
const projectId = getServerEnvVar('FIREBASE_PROJECT_ID');

const firebaseAdminConfig = {
  credential: cert({
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  }),
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseAdminConfig);
const firestore: Firestore = getFirestore(app);

export { firestore };
