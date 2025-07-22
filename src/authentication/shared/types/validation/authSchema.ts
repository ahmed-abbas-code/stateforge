// src/authentication/shared/validation/authSchema.ts

import { z } from 'zod';

export const authProviderEnum = z.enum(['firebase', 'auth0', 'jwt', 'composite']);

export const authUserSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().optional(),
  provider: authProviderEnum,
  providerId: z.string().min(1),

  // Optional access token (e.g., JWT, Firebase ID token)
  token: z.string().optional(),

  // Optional expiration timestamp in milliseconds (used for auto-refresh)
  expiresAt: z.number().optional(),
});

export type AuthProviderType = z.infer<typeof authProviderEnum>;
export type AuthUserType = z.infer<typeof authUserSchema>;
