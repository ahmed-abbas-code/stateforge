import { User as FirebaseUser } from 'firebase/auth';
import { authUserSchema } from '../../../types/validation/authSchema';
import type { AuthUser } from '../../../types/Auth';
import { validateSchema } from '../../../lib/validateSchema';

export function mapFirebaseToAuthUser(firebaseUser: FirebaseUser): AuthUser | null {
  const raw = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || undefined,
    provider: 'firebase',
    providerId: firebaseUser.providerData[0]?.providerId || 'firebase',
  };

  const result = validateSchema(authUserSchema, raw, 'AuthUser from Firebase');

  return result.success ? result.data : null;
}
