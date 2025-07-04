// packages/core/src/client/utils/axiosClient.ts

import axios, { AxiosInstance, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import { getAuth, getIdToken } from 'firebase/auth';

const BACKEND_APP_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_APP_REST_API_BASE_URL!;
const BACKEND_AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_AUTH_REST_API_BASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_BACKEND_API_KEY;

export type AuthStrategy = 'apiKey' | 'jwt' | 'idToken' | 'none';

interface AuthConfig {
  strategy?: AuthStrategy;
  overrideToken?: string;
}

function createClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 10_000,
  });

  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig & { authConfig?: AuthConfig }) => {
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      } as Record<string, string>;

      const { strategy = 'idToken', overrideToken } = config.authConfig || {};

      try {
        if (overrideToken) {
          headers['Authorization'] = `Bearer ${overrideToken}`;
        } else {
          switch (strategy) {
            case 'apiKey':
              if (!API_KEY) throw new Error('[axiosClient] Missing API_KEY');
              headers['Authorization'] = `Api-Key ${API_KEY}`;
              break;

            case 'jwt': {
              const token = localStorage.getItem('access_token');
              if (!token) throw new Error('[axiosClient] Missing JWT token');
              headers['Authorization'] = `Bearer ${token}`;
              break;
            }

            case 'idToken': {
              const user = getAuth().currentUser;
              if (!user) throw new Error('[axiosClient] No Firebase user');
              const idToken = await getIdToken(user, true);
              headers['Authorization'] = `Bearer ${idToken}`;
              break;
            }

            case 'none':
              break;
          }
        }
      } catch (err) {
        console.warn('[axiosClient] Failed to attach auth header:', err);
      }

      config.headers = AxiosHeaders.from(headers);
      return config;
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
