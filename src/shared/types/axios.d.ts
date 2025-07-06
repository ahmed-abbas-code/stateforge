// src/shared/types/axios.d.ts

import 'axios';
import type { AuthConfig } from '@authentication/auth/shared/types';

declare module 'axios' {
  interface AxiosRequestConfig {
    authConfig?: AuthConfig;
  }

  interface InternalAxiosRequestConfig {
    authConfig?: AuthConfig;
  }
}
