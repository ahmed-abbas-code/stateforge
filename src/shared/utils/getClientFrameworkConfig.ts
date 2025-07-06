// packages/shared/utils/getClientFrameworkConfig.ts

import { envPublicSchema } from '../types/validation/envSchema';
import type { PublicEnvVars } from '../types/validation/envSchema';

let cached: PublicEnvVars | null = null;

export function getClientFrameworkConfig(): PublicEnvVars {
  if (cached) return cached;

  const isBrowser = typeof window !== 'undefined';
  const rawEnv = isBrowser && window.__SF_ENV
    ? window.__SF_ENV
    : Object.fromEntries(
        Object.entries(process.env).filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
      );

  const parsed = envPublicSchema.safeParse(rawEnv);
  if (!parsed.success) {
    console.error('❌ ENV PARSE FAILED:', parsed.error.format());
    throw new Error('Invalid client-side environment config');
  }

  cached = parsed.data;
  return cached;
}
