import { env } from './envConfig';

export type AuthStrategy = 'firebase' | 'auth0';

export const config = {
  AUTH_STRATEGY: env.NEXT_PUBLIC_AUTH_STRATEGY,
  BACKEND_APP_API_BASE_URL: env.BACKEND_APP_API_BASE_URL,
  BACKEND_AUTH_API_BASE_URL: env.BACKEND_AUTH_API_BASE_URL,
} as const;
