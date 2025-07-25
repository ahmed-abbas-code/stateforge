// packages/shared/utils/baseAxiosClient.ts

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosRequestHeaders,
} from 'axios';
import axiosRetry from 'axios-retry';

export type AuthStrategyValue = 'apiKey' | 'jwt' | 'idToken' | 'firebase-sso' | 'none';

export interface AuthConfig {
  strategy?: AuthStrategyValue;
  overrideToken?: string;
  userId?: string;
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

            case 'idToken':
            case 'firebase-sso': {
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
