import { z } from 'zod';

export const envSchema = z.object({
  // Auth Strategy
  NEXT_PUBLIC_AUTH_STRATEGY: z.enum(['firebase', 'auth0']),

  // Firebase (client)
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),

  // Firebase (admin)
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),

  // Auth encryption
  NEXT_PUBLIC_AUTH_ENCRYPTION_SECRET: z.string().min(1),

  // Auth0
  AUTH0_CLIENT_ID: z.string().min(1),
  AUTH0_CLIENT_SECRET: z.string().min(1),
  AUTH0_DOMAIN: z.string().min(1),
  AUTH0_BASE_URL: z.string().url(),
  AUTH0_ISSUER_BASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url(),

  // REST APIs
  BACKEND_APP_API_BASE_URL: z.string().url(),
  BACKEND_AUTH_API_BASE_URL: z.string().url(),
});

export type EnvVars = z.infer<typeof envSchema>;
