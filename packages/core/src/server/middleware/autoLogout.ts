import { isDryRunEnv } from '@core/common/index';
import { adminAuth } from '../lib/firebase-admin';

/**
 * Validates the Firebase ID token.
 * Throws if expired, invalid, or revoked.
 */
export async function autoLogoutOnExpire(token: string) {
  try {
    if (isDryRunEnv) {
      console.log('[DummyMode] Skipping token verification');
      return {
        uid: 'dummy-uid',
        email: 'dummy@local.dev',
        dummy: true,
      };
    }

    // ✅ In real mode: verify token and check revocation
    const decoded = await adminAuth.verifyIdToken(token, true);
    return decoded;
  } catch (err) {
    console.error('[autoLogoutOnExpire] Token verification failed:', err);
    throw new Error('Token expired or revoked');
  }

}
