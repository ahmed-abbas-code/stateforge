export interface FrameworkConfig {
  AUTH_STRATEGY: 'firebase' | 'auth0' | 'dryrun';
  BACKEND_APP_API_BASE_URL: string;
  BACKEND_AUTH_API_BASE_URL: string;
}
