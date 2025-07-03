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

/** Build a pre-configured Axios instance for server-side use */
function createClient(baseURL: string, label: string): AxiosInstance {
  assertBaseUrl(baseURL, label);

  const instance = axios.create({
    baseURL,
    timeout: 10_000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(API_KEY ? { 'Authorization': `Api-Key ${API_KEY}` } : {}),
    },
  });

  // Debug outgoing request URLs
  instance.interceptors.request.use((config) => {
    const fullUrl = config.baseURL
      ? `${config.baseURL}${config.url ?? ''}`
      : config.url ?? '';
    console.log(`[axiosClient] ▶️ ${label} Request: ${fullUrl}`);
    return config;
  });

  // Handle auth errors
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

  // Retry network/server errors
  axiosRetry(instance, {
    retries: 2,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) =>
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      [502, 503, 504].includes(error.response?.status ?? 0),
  });

  return instance;
}

// Create Axios instances with label for clarity
export const axiosApp = createClient(BACKEND_APP_API_BASE_URL, 'axiosApp');
export const axiosAuth = createClient(BACKEND_AUTH_API_BASE_URL, 'axiosAuth');
