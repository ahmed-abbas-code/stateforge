import type { UserProfile } from '@auth0/nextjs-auth0/client';
import type { AuthUser } from '../../../types/Auth';

export function mapAuth0ToAuthUser(user: UserProfile): AuthUser {
  return {
    uid: user.sub || 'unknown',
    email: user.email || '',
    displayName: user.name ?? null,
    provider: 'auth0',
    providerId: user.sub || 'auth0-unknown',
  };
}
