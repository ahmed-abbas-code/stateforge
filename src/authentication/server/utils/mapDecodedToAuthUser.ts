// src/authentication/server/utils/mapDecodedToAuthUser.ts

import type { DecodedIdToken } from 'firebase-admin/auth';
import type { JwtPayload } from 'jsonwebtoken';
import type { SessionMap, AuthProviderType, AuthUserType } from '@authentication/shared';

type DecodedTokenLike = Partial<DecodedIdToken> & JwtPayload;

/**
 * Type guard: check if a decoded token is a Firebase ID token.
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
 * Normalize a single decoded token (Firebase or JWT) into AuthUserType.
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

/**
 * Helper to extract a primary AuthUserType from a SessionMap.
 * Prioritizes Firebase > Auth0 > JWT or falls back to first session.
 */
export function mapDecodedToAuthUserFromSessions(
  sessions: SessionMap,
  preferredOrder: AuthProviderType[] = ['firebase', 'auth0', 'jwt']
): AuthUserType {
  for (const provider of preferredOrder) {
    const match = Object.entries(sessions).find(
      ([, session]) => session.provider === provider
    );
    if (match) {
      return mapDecodedToAuthUser(match[1], provider);
    }
  }

  const [id, session] = Object.entries(sessions)[0] ?? [];
  if (!session) throw new Error('No valid session found');

  return mapDecodedToAuthUser(session, session.provider ?? (id as AuthProviderType));
}
