import { adminAuth } from '../lib/firebase-admin';

/**
 * Validates the Firebase ID token.
 * Throws if expired, invalid, or revoked.
 */
export async function autoLogoutOnExpire(token: string) {
  try {
    // The second argument `true` forces token revocation check
    const decoded = await adminAuth.verifyIdToken(token, true);
    return decoded; // Can use uid, email, etc.
  } catch (err) {
    // Handle any cleanup or logging if needed here
    throw new Error('Token expired or revoked');
  }
}
