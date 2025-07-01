// packages/core/src/server/utils/axiosClient.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { config } from '@core/common/utils/config';
import { auth } from '../lib/firebase'; // assumes server-only Firebase wrapper
import { auditLogoutEvent } from '../lib/auditLogger';

/** Build a pre-configured Axios instance for server-side use */
function createClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json' },
  });

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

  axiosRetry(instance, {
    retries: 2,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) =>
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      [502, 503, 504].includes(error.response?.status ?? 0),
  });

  return instance;
}

export const axiosApp = createClient(config.BACKEND_APP_API_BASE_URL);
export const axiosAuth = createClient(config.BACKEND_AUTH_API_BASE_URL);
