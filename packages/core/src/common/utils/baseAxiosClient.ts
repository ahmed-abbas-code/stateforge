// packages/core/src/common/utils/baseAxiosClient.ts

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosRequestHeaders,
} from 'axios';
import axiosRetry from 'axios-retry';

export type AuthStrategy = 'apiKey' | 'jwt' | 'idToken' | 'none';

export interface AuthConfig {
  strategy?: AuthStrategy;
  overrideToken?: string;
}

export abstract class BaseAxiosClient {
  protected abstract getApiKey(): string | null;
  protected abstract getJWT(): Promise<string | null>;
  protected abstract getIdToken(): Promise<string | null>;
  protected abstract isClient(): boolean;

  protected createClient(baseURL: string): AxiosInstance {
    const instance = axios.create({
      baseURL,
      timeout: 10_000,
    });

    instance.interceptors.request.use(
      async (
        config: InternalAxiosRequestConfig & { authConfig?: AuthConfig }
      ) => {
        const headers = config.headers as AxiosRequestHeaders;

        const existingAuth =
          headers['Authorization'] || headers['authorization'];

        if (existingAuth) {
          // Ensure JSON headers are present
          headers['Content-Type'] = headers['Content-Type'] || 'application/json';
          headers['Accept'] = headers['Accept'] || 'application/json';
          return config;
        }

        const { strategy = 'idToken', overrideToken } = config.authConfig || {};

        if (overrideToken) {
          headers['Authorization'] = `Bearer ${overrideToken}`;
        } else {
          switch (strategy) {
            case 'apiKey': {
              const key = this.getApiKey();
              if (!key) throw new Error('[AxiosClient] Missing API key');
              headers['Authorization'] = `Api-Key ${key}`;
              break;
            }

            case 'jwt': {
              const jwt = await this.getJWT();
              if (!jwt) throw new Error('[AxiosClient] Missing JWT token');
              headers['Authorization'] = `Bearer ${jwt}`;
              break;
            }

            case 'idToken': {
              const token = await this.getIdToken();
              if (!token) throw new Error('[AxiosClient] Missing Firebase ID token');
              headers['Authorization'] = `Bearer ${token}`;
              break;
            }

            case 'none':
              break;
          }
        }

        return config;
      }
    );

    axiosRetry(instance, {
      retries: 2,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error: AxiosError) =>
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        [502, 503, 504].includes(error.response?.status ?? 0),
    });

    return instance;
  }
}
