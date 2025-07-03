// packages/core/src/server/utils/axiosClient.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';

import { getServerFrameworkConfig } from '@core/common/utils/getServerFrameworkConfig';
import { getServerEnvVar } from '@core/common/utils/getServerEnvVar';
import { auth } from '../lib/firebase';
import { auditLogoutEvent } from '../lib/auditLogger';

const { BACKEND_APP_API_BASE_URL, BACKEND_AUTH_API_BASE_URL } = getServerFrameworkConfig();
const API_KEY = getServerEnvVar('BACKEND_API_KEY');

/** Runtime validation to prevent silent misconfig */
function assertBaseUrl(baseURL: string | undefined, label: string) {
  if (!baseURL) {
    throw new Error(`[axiosClient] ❌ ${label} is undefined. Check your environment variables and framework config.`);
  }
}

/**
 * Build a pre-configured Axios instance for server-side use
 * 
 * @param baseURL - The API base URL
 * @param label - A label for logging/debugging purposes
 * @param idToken - Optional Firebase ID token for user-authenticated requests
 */
function createClient(baseURL: string, label: string, idToken?: string): AxiosInstance {
  assertBaseUrl(baseURL, label);

  const instance = axios.create({
    baseURL,
    timeout: 10_000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(idToken
        ? { Authorization: `Bearer ${idToken}` }
        : API_KEY
        ? { Authorization: `Api-Key ${API_KEY}` }
        : {}),
    },
  });

  // Log outgoing requests
  instance.interceptors.request.use((config) => {
    const fullUrl = config.baseURL
      ? `${config.baseURL}${config.url ?? ''}`
      : config.url ?? '';
    console.log(`[axiosClient] ▶️ ${label} Request: ${fullUrl}`);
    return config;
  });

  // Handle 401/403 errors and trigger logout
  instance.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        const user = auth?.currentUser;
        if (user) auditLogoutEvent(user.uid);
        await auth.signOut().catch(console.error);
      }
      return Promise.reject(err);
    }
  );

  // Retry strategy for transient errors
  axiosRetry(instance, {
    retries: 2,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) =>
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      [502, 503, 504].includes(error.response?.status ?? 0),
  });

  return instance;
}

// Static instances (API Key-based)
export const axiosApp = createClient(BACKEND_APP_API_BASE_URL, 'axiosApp');
export const axiosAuth = createClient(BACKEND_AUTH_API_BASE_URL, 'axiosAuth');

// Dynamic instance for user-authenticated requests
export const createAuthenticatedAxiosApp = (idToken: string): AxiosInstance =>
  createClient(BACKEND_APP_API_BASE_URL, 'axiosApp (user)', idToken);
