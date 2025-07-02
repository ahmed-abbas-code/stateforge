// packages/core/src/common/types/env.d.ts

// Public keys available to client-side code
export type PublicEnvKey =
  | 'NEXT_PUBLIC_BACKEND_APP_REST_API_BASE_URL'
  | 'NEXT_PUBLIC_BACKEND_AUTH_REST_API_BASE_URL'
  | 'NEXT_PUBLIC_AUTH_ENCRYPTION_SECRET'
  // | 'NEXT_PUBLIC_FIREBASE_API_KEY'
  | 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
  | 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  | 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
  | 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
  | 'NEXT_PUBLIC_FIREBASE_APP_ID';

// Optional: Private keys for server-side only access
export type PrivateEnvKey =
  | 'FIREBASE_PRIVATE_KEY'
  | 'FIREBASE_CLIENT_EMAIL'
  | 'FIREBASE_PROJECT_ID';

// Combined type if needed for helpers
export type EnvKey = PublicEnvKey | PrivateEnvKey;

// Augment the global `window` object to support __SF_ENV on the client
declare global {
  interface Window {
    __SF_ENV?: Record<PublicEnvKey, string>;
  }
}

export {};
