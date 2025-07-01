// packages/core/src/client/utils/axiosClient.ts

import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { getAuth, getIdToken } from 'firebase/auth';
import { config } from '@core/common/utils/config';

/** Build a pre-configured Axios instance for client-side use */
function createClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use(async (req) => {
    const user = getAuth().currentUser;
    const token = user ? await getIdToken(user, true).catch(() => null) : null;
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });

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
