// packages/shared/utils/getClientFrameworkConfig.ts

import { envPublicSchema } from '../types/validation/envSchema';
import type { PublicEnvVars } from '../types/validation/envSchema';

let cached: PublicEnvVars | null = null;

export function getClientFrameworkConfig(): PublicEnvVars {
  if (cached) return cached;

  if (typeof window === 'undefined') {
    throw new Error('[getClientFrameworkConfig] Called on the server. This must run in the browser.');
  }

  const rawEnv = window.__SF_ENV;

  if (!rawEnv) {
    throw new Error('[getClientFrameworkConfig] Missing window.__SF_ENV. It must be injected via _document.tsx');
  }

  const parsed = envPublicSchema.safeParse(rawEnv);
  if (!parsed.success) {
    console.error('❌ ENV PARSE FAILED:', parsed.error.format());
    throw new Error('Invalid client-side environment config');
  }

  cached = parsed.data;
  return cached;
}
