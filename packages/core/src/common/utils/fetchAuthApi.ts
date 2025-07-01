import axios from 'axios';

/** 
 * Base URL for the *authentication* backend.
 * Make sure `.env.local` (or your deployment secrets) contains:
 *
 *   NEXT_PUBLIC_BACKEND_AUTH_REST_API_BASE_URL=https://auth.myapp.com
 */
const baseURL = process.env.NEXT_PUBLIC_BACKEND_AUTH_REST_API_BASE_URL;

if (!baseURL) {
  console.warn(
    '[StateForge] Missing NEXT_PUBLIC_BACKEND_AUTH_REST_API_BASE_URL in environment'
  );
}

/**
 * Axios instance for **Auth-related** calls
 * ─────────────────────────────────────────
 * • Same timeout / JSON defaults as `fetchAppApi`
 * • Sends credentials (cookies) if your auth server relies on them
 * • Automatically attaches `Bearer` token (Firebase / Auth0) when available
 */
export const fetchAuthApi = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ───────── REQUEST INTERCEPTOR ───────── */
fetchAuthApi.interceptors.request.use(async (config) => {
  /**
   * Replace this logic with your framework’s
   * centralized token retrieval if needed.
   * For Firebase you might use:
   *
   *   import { auth } from '@/lib/firebase';
   *   const token = auth.currentUser 
   *     ? await auth.currentUser.getIdToken()
   *     : null;
   *
   * For Auth0 you might rely on cookies only.
   */
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('auth_token')
      : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ───────── RESPONSE INTERCEPTOR (optional) ─────────
   You can reuse the same 401 / 403 auto-logout logic
   implemented in axiosClient.ts, if desired:

fetchAuthApi.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      // e.g. signOut(auth) or Auth0 logout redirect
    }
    return Promise.reject(err);
  }
);
*/
