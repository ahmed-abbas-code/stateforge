// src/authentication/server/utils/mapDecodedToAuthUser.ts

import type { DecodedIdToken } from 'firebase-admin/auth';
import type { JwtPayload } from 'jsonwebtoken';
import { AuthProviderType, AuthUserType } from '@authentication/shared';

type DecodedTokenLike = Partial<DecodedIdToken> & JwtPayload;

/**
 * Type guard to check if object is a Firebase DecodedIdToken.
 */
function isDecodedIdToken(token: unknown): token is DecodedIdToken {
  return (
    typeof token === 'object' &&
    token !== null &&
    'uid' in token &&
    'email' in token
  );
}

/**
 * Accepts a Firebase DecodedIdToken or generic JwtPayload
 * and normalizes it into an AuthUserType for SF.
 */
export function mapDecodedToAuthUser(
  decoded: DecodedTokenLike,
  provider: AuthProviderType
): AuthUserType {
  const uid =
    decoded.uid ??
    decoded.sub ??
    (decoded as Record<string, unknown>).id;

  const email = decoded.email ?? '';

  if (!uid || !email) {
    throw new Error(
      `[mapDecodedToAuthUser] Missing required fields: uid=${uid}, email=${email}`
    );
  }

  const rawName =
    decoded.name ??
    decoded.displayName ??
    (decoded as Record<string, unknown>).nickname;

  const displayName = typeof rawName === 'string' ? rawName : undefined;

  const providerId =
    provider === 'firebase' && isDecodedIdToken(decoded)
      ? decoded.firebase?.sign_in_provider ?? 'firebase'
      : provider;

  return {
    uid: String(uid),
    email,
    displayName,
    provider,
    providerId,
  };
}
