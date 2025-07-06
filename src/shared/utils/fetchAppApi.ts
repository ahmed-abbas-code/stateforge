// packages/shared/utils/fetchAppApi.ts

import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_APP_REST_API_BASE_URL;

if (!baseURL) {
  console.warn('[StateForge] Missing NEXT_PUBLIC_BACKEND_APP_REST_API_BASE_URL in environment');
}

export const fetchAppApi = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Only register this interceptor in the browser
if (typeof window !== 'undefined') {
  fetchAppApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}
