// packages/core/src/common/utils/configStore.ts

import { z } from 'zod';
import { envSchema } from '../types/validation/envSchema';

type BaseEnv = z.infer<typeof envSchema>;
export type FrameworkConfig = BaseEnv & { isDryRun: boolean };

let cached: FrameworkConfig | null = null;
let initialized = false;

/**
 * Lazily parses and returns the framework config.
 * Automatically caches after first call.
 */
export function getFrameworkConfig(): FrameworkConfig {
  if (cached) return cached;

  if (process.env.NODE_ENV === 'development') {
    if (initialized) {
      console.warn('[StateForge] Config already initialized. Skipping re-init.');
      return cached!;
    }
    initialized = true;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ ENV PARSE FAILED:', parsed.error.format());
    throw new Error('Invalid environment config');
  }

  cached = {
    ...parsed.data,
    isDryRun:
      parsed.data.NEXT_PUBLIC_ENV === 'dryrun' ||
      parsed.data.NEXT_PUBLIC_AUTH_STRATEGY === 'dryrun',
  };

  return cached;
}

/**
 * Proxy-based accessor for config fields after setup.
 * Safe for use after boot (e.g. in React, API routes).
 */
export const config: FrameworkConfig = new Proxy(
  {},
  {
    get(_, prop: keyof FrameworkConfig) {
      return getFrameworkConfig()[prop];
    },
  }
) as FrameworkConfig;
