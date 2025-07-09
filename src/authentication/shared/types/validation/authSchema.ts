// src/authentication/shared/validation/authSchema.ts
import { z } from 'zod';

// ✅ Added 'backend' as a valid provider
export const authProviderEnum = z.enum(['firebase', 'auth0', 'jwt']);

export const authUserSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().optional(),
  provider: authProviderEnum,
  providerId: z.string().min(1),
});

export type AuthProviderType = z.infer<typeof authProviderEnum>;
export type AuthUserType = z.infer<typeof authUserSchema>;
