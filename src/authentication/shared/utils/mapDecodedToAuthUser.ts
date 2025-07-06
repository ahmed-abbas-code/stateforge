// src/authentication/shared/utils/mapDecodedToAuthUser.ts

import { AuthProvider, AuthUser } from '@authentication/auth/shared';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { JwtPayload } from 'jsonwebtoken';

/**
 * Accepts either a Firebase DecodedIdToken or a generic JwtPayload.
 */
export function mapDecodedToAuthUser(
  decoded: Partial<DecodedIdToken> | JwtPayload,
  provider: AuthProvider
): AuthUser {
  const uid = decoded.uid || decoded.sub || decoded.id;
  const email = decoded.email ?? '';

  if (!uid || !email) {
    throw new Error(`[mapDecodedToAuthUser] Missing required fields: uid=${uid}, email=${email}`);
  }

  return {
    uid,
    email,
    displayName: decoded.name ?? decoded.displayName ?? null,
    providerId:
      provider === 'firebase'
        ? (decoded as DecodedIdToken).firebase?.sign_in_provider ?? 'firebase'
        : provider,
    provider,
  };
}
