import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config(); // load .env.local or .env.* at runtime

// === Define schema
const envSchema = z.object({
  // Core
  NEXT_PUBLIC_AUTH_STRATEGY: z.enum(['firebase', 'auth0']),
  NEXT_PUBLIC_ENV: z.enum(['development', 'staging', 'production']),

  // Backend API URLs
  BACKEND_APP_API_BASE_URL: z.string().url(),
  BACKEND_AUTH_API_BASE_URL: z.string().url(),

  // Encryption
  NEXT_PUBLIC_AUTH_ENCRYPTION_SECRET: z.string().min(32),

  // Firebase (Client)
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string(),

  // Firebase Admin (Server)
  FIREBASE_PRIVATE_KEY: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string().email(),

  // Auth0
  AUTH0_CLIENT_ID: z.string().optional(),
  AUTH0_CLIENT_SECRET: z.string().optional(),
  AUTH0_DOMAIN: z.string().optional(),
  AUTH0_BASE_URL: z.string().url().optional(),
  AUTH0_ISSUER_BASE_URL: z.string().url().optional(),

  // Redis
  REDIS_URL: z.string().optional(),

  // Firestore (optional)
  FIRESTORE_CREDENTIALS_JSON: z.string().optional(),

  // Session / JWT
  JWT_SECRET: z.string().optional(),
  SESSION_SECRET: z.string().optional(),
});

// === Parse + expose
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  throw new Error('Failed to load environment variables. See above.');
}

export const env = parsed.data;
