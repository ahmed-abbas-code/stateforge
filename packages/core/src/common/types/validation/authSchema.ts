import { z } from 'zod';

export const authUserSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().optional(),
  provider: z.enum(['firebase', 'auth0']),
  providerId: z.string().min(1), 
});

export type AuthUser = z.infer<typeof authUserSchema>;
