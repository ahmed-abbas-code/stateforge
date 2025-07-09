// src/shared/types/FrameworkConfig.ts

export interface FrameworkConfig {
  AUTH_STRATEGY: 'firebase' | 'firebase-sso' | 'auth0' | 'jwt';
  BACKEND_APP_API_BASE_URL: string;
  BACKEND_AUTH_API_BASE_URL: string;
}
