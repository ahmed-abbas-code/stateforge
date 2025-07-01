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

// Optional: add interceptors
fetchAppApi.interceptors.request.use((config) => {
  // Example: attach token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
