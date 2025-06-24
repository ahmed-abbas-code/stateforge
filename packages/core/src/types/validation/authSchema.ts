import { z } from 'zod';

export const authUserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  provider: z.enum(['firebase', 'auth0']),
});

export type AuthUser = z.infer<typeof authUserSchema>;
