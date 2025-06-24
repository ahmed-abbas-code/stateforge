import axios, { AxiosInstance } from 'axios';
import { config } from './config';
import { auth } from './firebase';
import { getIdToken } from 'firebase/auth';

// Optional: import auditLogger or logout logic
import { auditLogoutEvent } from './auditLogger';

function createClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // === Request Interceptor: inject auth token ===
  instance.interceptors.request.use(async (req) => {
    const user = auth?.currentUser;
    const token = user ? await getIdToken(user, true).catch(() => null) : null;

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  });

  // === Response Interceptor: handle 401/403 ===
  instance.interceptors.response.use(
    (res) => res,
    async (err) => {
      const status = err.response?.status;

      if (status === 401 || status === 403) {
        const user = auth?.currentUser;
        if (user) auditLogoutEvent(user.uid);

        console.warn(`[StateForge] Unauthorized (${status}). Logging out...`);
        await auth.signOut().catch(console.error); // or Auth0 logout if using Auth0
      }

      return Promise.reject(err);
    }
  );

  return instance;
}

// ✅ Exported clients
export const axiosApp = createClient(config.BACKEND_APP_API_BASE_URL);
export const axiosAuth = createClient(config.BACKEND_AUTH_API_BASE_URL);
