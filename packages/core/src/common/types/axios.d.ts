// packages/core/src/common/types/axios.d.ts

import 'axios';
import type { AuthConfig } from '@core/common/utils/baseAxiosClient';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    authConfig?: AuthConfig;
  }
}
