// src/authentication/server/middleware/autoLogoutOnExpire.ts

import { adminAuth } from '@authentication/server/middleware';

/**
 * Validates the Firebase ID token.
 * Throws if expired, invalid, or revoked.
 */
export async function autoLogoutOnExpire(token: string) {
  try {
    // ✅ Verify token and check revocation
    const decoded = await adminAuth.verifyIdToken(token, true);
    return decoded;
  } catch (err) {
    console.error('[autoLogoutOnExpire] Token verification failed:', err);
    throw new Error('Token expired or revoked');
  }
}
