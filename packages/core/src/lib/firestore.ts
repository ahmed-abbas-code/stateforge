import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { env } from './envConfig';

const firebaseAdminConfig = {
  credential: cert({
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
};

// Prevent re-initialization in serverless / hot-reload environments
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseAdminConfig);

export const firestore = getFirestore(app);
