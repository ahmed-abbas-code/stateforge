/* ----------------------------------------------------------------
   axiosClient.ts  – centralised Axios client with interceptors,
   automatic token injection, retry logic, and 401/403 auto-logout.
---------------------------------------------------------------- */
import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { config } from './config';
import { auth } from './firebase';
import { getIdToken } from 'firebase/auth';
import { auditLogoutEvent } from './auditLogger';

/** Build a pre-configured Axios instance */
function createClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json' },
  });

  /* ---------- Request: inject Firebase (or Auth0) bearer token ---------- */
  instance.interceptors.request.use(async (req) => {
    const user = auth?.currentUser;
    const token = user ? await getIdToken(user, /* forceRefresh */ true).catch(() => null) : null;
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });

  /* ---------- Response: global auth error handling ---------- */
  instance.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        const user = auth?.currentUser;
        if (user) auditLogoutEvent(user.uid);

        console.warn(`[StateForge] HTTP ${status}. Signing user out.`);
        await auth.signOut().catch(console.error);          // swap for Auth0 logout if needed
      }
      return Promise.reject(err);
    }
  );

  /* ---------- Automatic retry (network / 5xx) ---------- */
  axiosRetry(instance, {
    retries: 2,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) =>
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      [502, 503, 504].includes(error.response?.status ?? 0),
  });

  return instance;
}

/* ----------------------------------------------------------------
   Public, pre-configured clients
---------------------------------------------------------------- */
export const axiosApp  = createClient(config.BACKEND_APP_API_BASE_URL);
export const axiosAuth = createClient(config.BACKEND_AUTH_API_BASE_URL);
