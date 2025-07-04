// packages/core/src/server/utils/axiosClient.ts

import { getServerFrameworkConfig } from '../../common/utils/getServerFrameworkConfig';
import { getServerEnvVar } from '../../common/utils/getServerEnvVar';
import { auth } from '../lib/firebase';
import { auditLogoutEvent } from '../lib/auditLogger';
import type { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { BaseAxiosClient } from '@core/common/utils/baseAxiosClient';
import type { AuthStrategy } from '@core/common/utils/baseAxiosClient';

const {
  BACKEND_APP_API_BASE_URL,
  BACKEND_AUTH_API_BASE_URL,
} = getServerFrameworkConfig();

const API_KEY = getServerEnvVar('BACKEND_API_KEY');

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
      const fullUrl = config.baseURL
        ? `${config.baseURL}${config.url ?? ''}`
        : config.url ?? '';
      console.log(`[axiosClient] ▶️ ${label} Request: ${fullUrl}`);
      return config;
    });

    client.interceptors.response.use(
      (res) => res,
      async (err) => {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          const user = auth?.currentUser;
          if (user) auditLogoutEvent(user.uid);
          await auth.signOut().catch(console.error);
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

// Default Axios clients (unauthenticated or preconfigured)
export const axiosApp = instance.createClientWithInterceptors(
  BACKEND_APP_API_BASE_URL,
  'axiosApp'
);
export const axiosAuth = instance.createClientWithInterceptors(
  BACKEND_AUTH_API_BASE_URL,
  'axiosAuth'
);

// Explicit JWT-based authenticated client
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

// New: Flexible strategy-based server-side Axios client
type ServerAuthOptions =
  | { type: 'jwt'; token: string }
  | { type: 'apiKey' };

export const createServerAxiosApp = (auth: ServerAuthOptions): AxiosInstance => {
  const label =
    auth.type === 'jwt' ? 'axiosApp (jwt)' : 'axiosApp (apiKey)';

  const client = instance.createClientWithInterceptors(
    BACKEND_APP_API_BASE_URL,
    label
  );

  client.interceptors.request.use((config) => {
    config.authConfig = {
      strategy: auth.type as AuthStrategy,
      overrideToken: auth.type === 'jwt' ? auth.token : undefined,
    };

    // Optional: redundant but explicit header setting
    if (auth.type === 'jwt') {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${auth.token}`;
    }

    return config;
  });

  return client;
};
