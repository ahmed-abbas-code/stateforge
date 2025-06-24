// packages/core/src/lib/verifyFirebaseToken.ts

import { adminAuth } from './firebase-admin';

export async function verifyFirebaseToken(token: string) {
  return await adminAuth.verifyIdToken(token);
}
