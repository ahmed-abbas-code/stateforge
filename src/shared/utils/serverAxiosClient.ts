// src/shared/utils/serverAxiosClient.ts

import { auditLogoutEvent } from '@authentication/server';
import { AuthStrategyValue, BaseAxiosClient } from '@shared';
import { getServerEnvVar, getServerFrameworkConfig } from '@shared/utils/server';
import type { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

const {
  BACKEND_APP_API_BASE_URL,
  BACKEND_AUTH_API_BASE_URL,
} = getServerFrameworkConfig();

const API_KEY = getServerEnvVar('BACKEND_API_KEY');
const recentRequests = new Map<string, number>();
const DEDUP_MS = 5000; // 5 seconds

export class ServerAxiosClient extends BaseAxiosClient {
  protected getApiKey(): string | null {
    return API_KEY;
  }

  protected async getJWT(): Promise<string | null> {
    throw new Error('[ServerAxiosClient] JWT must be passed explicitly');
  }

  protected async getIdToken(): Promise<string | null> {
    throw new Error('[ServerAxiosClient] ID token must be passed explicitly');
  }

  protected isClient(): boolean {
    return false;
  }

  public createClientWithInterceptors(baseURL: string, label: string): AxiosInstance {
    const client = this.createClient(baseURL);

    client.interceptors.request.use((config) => {
      const method = config.method?.toUpperCase() ?? 'GET';
      const fullUrl = config.baseURL
        ? `${config.baseURL}${config.url ?? ''}`
        : config.url ?? '';

      const key = `${method}:${fullUrl}`;
      const now = Date.now();
      const last = recentRequests.get(key);

      if (method === 'GET' && last && now - last < DEDUP_MS) {
        // Skip duplicate GET request logging
        return config;
      }

      recentRequests.set(key, now);
      console.log(`[axiosClient] ▶️ ${label} Request: ${fullUrl}`);
      return config;
    });

    client.interceptors.response.use(
      (res) => res,
      async (err) => {
        const status = err.response?.status;

        if (status === 401 || status === 403) {
          const userId = err.config?.authConfig?.userId;
          if (userId) auditLogoutEvent(userId);
          console.warn(`[axiosClient] 🔒 Unauthorized (${status}) — access blocked.`);
        }

        return Promise.reject(err);
      }
    );

    axiosRetry(client, {
      retries: 2,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) =>
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        [502, 503, 504].includes(error.response?.status ?? 0),
    });

    return client;
  }
}

const instance = new ServerAxiosClient();

export const axiosApp = instance.createClientWithInterceptors(
  BACKEND_APP_API_BASE_URL,
  'axiosApp'
);

export const axiosAuth = instance.createClientWithInterceptors(
  BACKEND_AUTH_API_BASE_URL,
  'axiosAuth'
);

export const createAuthenticatedAxiosApp = (token: string): AxiosInstance => {
  const client = instance.createClientWithInterceptors(
    BACKEND_APP_API_BASE_URL,
    'axiosApp (user)'
  );

  client.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  });

  return client;
};

type ServerAuthOptions =
  | { type: 'jwt'; token: string; userId?: string }
  | { type: 'apiKey' };

export const createServerAxiosApp = (auth: ServerAuthOptions): AxiosInstance => {
  const label = auth.type === 'jwt' ? 'axiosApp (jwt)' : 'axiosApp (apiKey)';

  const client = instance.createClientWithInterceptors(
    BACKEND_APP_API_BASE_URL,
    label
  );

  client.interceptors.request.use((config) => {
    config.authConfig = {
      strategy: auth.type as AuthStrategyValue,
      overrideToken: auth.type === 'jwt' ? auth.token : undefined,
      userId: 'userId' in auth ? auth.userId : undefined,
    };

    if (auth.type === 'jwt') {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${auth.token}`;
    }

    return config;
  });

  return client;
};
