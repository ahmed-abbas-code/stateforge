// packages/core/src/server/middleware/autoLogout.ts

import { adminAuth } from '../lib/firebase-admin';
import { getServerFrameworkConfig } from '@core/common/utils/getServerFrameworkConfig';

const { isDryRun } = getServerFrameworkConfig();

/**
 * Validates the Firebase ID token.
 * Throws if expired, invalid, or revoked.
 */
export async function autoLogoutOnExpire(token: string) {
  try {
    if (isDryRun) {
      console.log('[DryRunMode] Skipping token verification');
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
