// packages/core/src/client/utils/axiosClient.ts

import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { getAuth, getIdToken } from 'firebase/auth';

/**
 * ✅ Client-safe public environment variables
 * These must be prefixed with NEXT_PUBLIC_ and defined in `.env.client.local`
 */
const BACKEND_APP_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_APP_REST_API_BASE_URL!;
const BACKEND_AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_AUTH_REST_API_BASE_URL!;

/** ✅ Build a pre-configured Axios instance for client-side use */
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

/** ✅ Export properly scoped client instances */
export const axiosApp = createClient(BACKEND_APP_API_BASE_URL);
export const axiosAuth = createClient(BACKEND_AUTH_API_BASE_URL);
