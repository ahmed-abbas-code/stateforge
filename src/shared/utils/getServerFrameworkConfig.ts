// packages/shared/utils/getServerFrameworkConfig.ts

import { envSchema, EnvVars } from '../types/validation/envSchema.js';

let cached: EnvVars & { isDryRun: boolean } | null = null;
let initialized = false;

export function getServerFrameworkConfig(): EnvVars & { isDryRun: boolean } {
  if (typeof window !== 'undefined') {
    const errorMsg = `[getServerFrameworkConfig] Attempted to run on the client. This must only be used in server-side code.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (cached) return cached;

  if (process.env.NODE_ENV === 'development') {
    if (initialized) {
      console.warn('[StateForge] Server config already initialized. Skipping re-parse.');
      return cached!;
    }
    initialized = true;
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ ENV PARSE FAILED (server):', parsed.error.format());
    throw new Error('Invalid server-side environment config');
  }

  cached = {
    ...parsed.data,
    isDryRun:
      parsed.data.NEXT_PUBLIC_ENV === 'dryrun' ||
      parsed.data.NEXT_PUBLIC_AUTH_STRATEGY === 'dryrun',
  };

  return cached;
}
