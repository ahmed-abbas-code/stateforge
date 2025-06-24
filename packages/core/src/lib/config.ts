import { z } from 'zod';

export type AuthStrategy = 'firebase' | 'auth0';

export type AppConfig = {
  AUTH_STRATEGY: AuthStrategy;
  BACKEND_APP_API_BASE_URL: string;
  BACKEND_AUTH_API_BASE_URL: string;
};

// ✅ Zod schema for runtime validation
const ConfigSchema = z.object({
  AUTH_STRATEGY: z.enum(['firebase', 'auth0']),
  BACKEND_APP_API_BASE_URL: z.string().url(),
  BACKEND_AUTH_API_BASE_URL: z.string().url()
});

// ✅ Runtime-validated + statically typed config
export const config: AppConfig = ConfigSchema.parse({
  AUTH_STRATEGY: process.env.NEXT_PUBLIC_AUTH_STRATEGY,
  BACKEND_APP_API_BASE_URL: process.env.NEXT_PUBLIC_BACKEND_APP_API_BASE_URL,
  BACKEND_AUTH_API_BASE_URL: process.env.NEXT_PUBLIC_BACKEND_AUTH_API_BASE_URL
});
