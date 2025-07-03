// packages/core/src/server/utils/axiosClient.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';

import { getServerFrameworkConfig } from '@core/common/utils/getServerFrameworkConfig';
import { getServerEnvVar } from '@core/common/utils/getServerEnvVar';
import { auth } from '../lib/firebase';
import { auditLogoutEvent } from '../lib/auditLogger';

const { BACKEND_APP_API_BASE_URL, BACKEND_AUTH_API_BASE_URL } = getServerFrameworkConfig();
const API_KEY = getServerEnvVar('BACKEND_API_KEY');

if (!API_KEY) {
  console.warn('[StateForge] Warning: BACKEND_API_KEY is not set — requests may fail with 403');
}

/** Build a pre-configured Axios instance for server-side use */
function createClient(baseURL: string): AxiosInstance {
  if (!baseURL) {
    throw new Error('[StateForge] Axios client creation failed — baseURL is missing');
  }

  const instance = axios.create({
    baseURL,
    timeout: 10_000,
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
    },
  });

  instance.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
      const status = err.response?.status;
      console.error(`[StateForge][AxiosClient] Response error ${status}:`, err.message);

      if (status === 401 || status === 403) {
        const user = auth?.currentUser;
        if (user) auditLogoutEvent(user.uid);
        await auth.signOut().catch(console.error);
      }

      return Promise.reject(err);
    }
  );

  axiosRetry(instance, {
    retries: 2,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) =>
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      [502, 503, 504].includes(error.response?.status ?? 0),
  });

  return instance;
}

export const axiosApp = createClient(BACKEND_APP_API_BASE_URL);
export const axiosAuth = createClient(BACKEND_AUTH_API_BASE_URL);
