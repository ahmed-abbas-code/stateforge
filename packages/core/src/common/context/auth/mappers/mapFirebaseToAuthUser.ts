// packages/core/src/common/context/auth/mappers/mapFirebaseToAuthUser.ts
import { User as FirebaseUser } from 'firebase/auth';
import { authUserSchema } from '../../../types/validation/authSchema';
import type { AuthUser } from '../../../types/Auth';
import { validateSchema } from '@core/common/utils';

export function mapFirebaseToAuthUser(firebaseUser: FirebaseUser): AuthUser | null {
  const raw: Partial<AuthUser> = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || undefined,
    provider: 'firebase',
    providerId: firebaseUser.providerData[0]?.providerId || 'firebase',
  };

  const result = validateSchema(authUserSchema, raw, 'AuthUser from Firebase');
  return result.success ? result.data : null;
}
