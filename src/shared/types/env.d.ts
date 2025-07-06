// src/shared/types/env.d.ts

// Public environment variables (exposed to client/browser)
export type PublicEnvVar =
  | 'NEXT_PUBLIC_BACKEND_APP_REST_API_BASE_URL'
  | 'NEXT_PUBLIC_BACKEND_AUTH_REST_API_BASE_URL'
  | 'NEXT_PUBLIC_AUTH_ENCRYPTION_SECRET'
  | 'NEXT_PUBLIC_FIREBASE_API_KEY'
  | 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
  | 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  | 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
  | 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
  | 'NEXT_PUBLIC_FIREBASE_APP_ID';

// Private environment variables (server-only, sensitive)
export type PrivateEnvVar =
  | 'FIREBASE_PRIVATE_KEY'
  | 'FIREBASE_CLIENT_EMAIL'
  | 'FIREBASE_PROJECT_ID'
  | 'BACKEND_APP_API_BASE_URL'
  | 'BACKEND_AUTH_API_BASE_URL'
  | 'BACKEND_API_KEY';

// Union type for general usage
export type EnvVar = PublicEnvVar | PrivateEnvVar;

// Augment the global `window` object for SSR-safe hydration
declare global {
  interface Window {
    __SF_ENV?: Record<PublicEnvVar, string>;
  }
}

export {};
