// packages/core/src/common/types/env.d.ts 

export type PublicEnvKey =
  | 'NEXT_PUBLIC_AUTH_ENCRYPTION_SECRET'
  | 'NEXT_PUBLIC_BACKEND_APP_REST_API_BASE_URL'
  | 'NEXT_PUBLIC_BACKEND_AUTH_REST_API_BASE_URL';

/** Extra env map injected into the browser at runtime */
declare global {
  interface Window {
    __SF_ENV?: Record<PublicEnvKey, string>;
  }
}

export {};
