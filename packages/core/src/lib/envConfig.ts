import { z, type SafeParseReturnType } from 'zod';
import dotenv from 'dotenv';

// ✅ Explicitly load the correct .env file (e.g. .env.dryrun if passed)
dotenv.config({
  path: process.env.DOTENV_CONFIG_PATH || '.env.local',
});

console.log('[env] DOTENV_CONFIG_PATH:', process.env.DOTENV_CONFIG_PATH);
console.log('[env] Loaded NEXT_PUBLIC_ENV:', process.env.NEXT_PUBLIC_ENV);

const isDryRunEnv =
  process.env.NEXT_PUBLIC_ENV === 'dryrun' ||
  process.env.NEXT_PUBLIC_AUTH_STRATEGY === 'dryrun';

console.log('[env debug] isDryRunEnv:', isDryRunEnv);

const envSchema = z.object({
  // ✅ Include 'dryrun' in allowed values
  NEXT_PUBLIC_AUTH_STRATEGY: z.enum(['firebase', 'auth0', 'dryrun']),
  NEXT_PUBLIC_ENV: z.enum(['development', 'staging', 'production', 'dryrun']),

  BACKEND_APP_API_BASE_URL: z.string().url(),
  BACKEND_AUTH_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_AUTH_ENCRYPTION_SECRET: z.string().min(32),

  NEXT_PUBLIC_FIREBASE_API_KEY: z.string(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string(),

  FIREBASE_PRIVATE_KEY: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string().email(),

  AUTH0_CLIENT_ID: z.string().optional(),
  AUTH0_CLIENT_SECRET: z.string().optional(),
  AUTH0_DOMAIN: z.string().optional(),
  AUTH0_BASE_URL: z.string().url().optional(),
  AUTH0_ISSUER_BASE_URL: z.string().url().optional(),

  REDIS_URL: z.string().optional(),
  FIRESTORE_CREDENTIALS_JSON: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  SESSION_SECRET: z.string().optional(),
});

let parsed: SafeParseReturnType<unknown, z.infer<typeof envSchema>>;

if (isDryRunEnv) {
  if (process.env.NEXT_PUBLIC_ENV !== 'dryrun') {
    throw new Error(
      'Dry run mode is active, but NEXT_PUBLIC_ENV is not set to "dryrun". Check your .env file.'
    );
  }

  parsed = {
    success: true,
    data: process.env as unknown as z.infer<typeof envSchema>,
  };
} else {
  parsed = envSchema.safeParse(process.env);
}

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  throw new Error('Failed to load environment variables. See above.');
}

export const env = parsed.data;
export const isDryRun = isDryRunEnv;
