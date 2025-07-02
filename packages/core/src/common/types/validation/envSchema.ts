// packages/core/src/common/types/validation/envSchema.ts
import { z } from 'zod';

export const envSchema = z.object({
  // General
  NEXT_PUBLIC_ENV: z.enum(['development', 'staging', 'production', 'dryrun']),
  NEXT_PUBLIC_AUTH_STRATEGY: z.enum(['firebase', 'auth0', 'dryrun']),

  // Firebase (client)
  // NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1).optional(),

  // Firebase (admin)
  FIREBASE_PRIVATE_KEY: z.string().min(1).optional(),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),

  // Auth encryption
  NEXT_PUBLIC_AUTH_ENCRYPTION_SECRET: z.string().min(1).optional(),

  // Auth0
  AUTH0_CLIENT_ID: z.string().min(1).optional(),
  AUTH0_CLIENT_SECRET: z.string().min(1).optional(),
  AUTH0_DOMAIN: z.string().min(1).optional(),
  AUTH0_BASE_URL: z.string().url().optional(),
  AUTH0_ISSUER_BASE_URL: z.string().url().optional(),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // REST APIs
  BACKEND_APP_API_BASE_URL: z.string().url(),
  BACKEND_AUTH_API_BASE_URL: z.string().url(),
  BACKEND_API_KEY: z.string().min(1).optional(),
});

export type EnvVars = z.infer<typeof envSchema>;