// packages/core/src/client/utils/axiosClient.ts

import { getAuth, getIdToken } from 'firebase/auth';
import { BaseAxiosClient } from '@core/common/utils/baseAxiosClient';

const BACKEND_APP_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_APP_REST_API_BASE_URL!;
const BACKEND_AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_AUTH_REST_API_BASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_BACKEND_API_KEY || null;

class ClientAxiosClient extends BaseAxiosClient {
  protected getApiKey(): string | null {
    return API_KEY;
  }

  protected async getJWT(): Promise<string | null> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('[ClientAxiosClient] JWT not found in localStorage');
    return token;
  }

  protected async getIdToken(): Promise<string | null> {
    const user = getAuth().currentUser;
    if (!user) throw new Error('[ClientAxiosClient] Firebase user not authenticated');
    return await getIdToken(user, true);
  }

  protected isClient(): boolean {
    return typeof window !== 'undefined';
  }

  public createAppClient() {
    return this.createClient(BACKEND_APP_API_BASE_URL);
  }

  public createAuthClient() {
    return this.createClient(BACKEND_AUTH_API_BASE_URL);
  }
}

const clientAxios = new ClientAxiosClient();
export const axiosApp = clientAxios.createAppClient();
export const axiosAuth = clientAxios.createAuthClient();