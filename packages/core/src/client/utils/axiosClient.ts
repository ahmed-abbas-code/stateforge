// packages/core/src/client/utils/axiosClient.ts

import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { getAuth, getIdToken } from 'firebase/auth';

// Must be defined in .env.client.local with NEXT_PUBLIC_ prefix
const BACKEND_APP_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_APP_REST_API_BASE_URL!;
const BACKEND_AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_AUTH_REST_API_BASE_URL!;

function createClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 10_000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  instance.interceptors.request.use(async (config) => {
    try {
      const user = getAuth().currentUser;
      if (user) {
        const token = await getIdToken(user, true);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.warn('[axiosClient] ⚠️ Failed to attach ID token:', error);
    }
    return config;
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

export const axiosApp = createClient(BACKEND_APP_API_BASE_URL);
export const axiosAuth = createClient(BACKEND_AUTH_API_BASE_URL);
