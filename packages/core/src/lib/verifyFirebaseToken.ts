// packages/core/src/lib/verifyFirebaseToken.ts

import { adminAuth } from './firebase-admin';

/**
 * Verifies a Firebase ID token using the Firebase Admin SDK.
 * In dryrun mode, returns a fixed fake user.
 */
export async function verifyFirebaseToken(token: string) {
  const result = await adminAuth.verifyIdToken(token);

  // Optional: Log dryrun mode verification
  if (result?.uid === 'dummy-user') {
    console.log('[DryRun Mode] Token verified as dummy user');
  }

  return result;
}
