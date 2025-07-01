// packages/core/src/common/utils/configStore.ts
import { z } from 'zod';
import { envSchema } from '../types/validation/envSchema';

type BaseEnv = z.infer<typeof envSchema>;
export type FrameworkConfig = BaseEnv & { isDryRun: boolean };

let cached: FrameworkConfig | null = null;

/**
 * Call this early in your app lifecycle (e.g., _app.tsx or server entrypoint).
 */
export function setupStateForgeConfig(): FrameworkConfig {
  const raw = process.env;
  const parsed = envSchema.safeParse(raw);

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
 * Returns the initialized config. Must call setupStateForgeConfig() before use.
 */
export function getFrameworkConfig(): FrameworkConfig {
  if (!cached) throw new Error('Call setupStateForgeConfig() first');
  return cached;
}

/**
 * Optional helper: lazy-loaded proxy to config.
 * Useful if you're certain setup was already called during bootstrapping.
 */
export const config: FrameworkConfig = new Proxy(
  {},
  {
    get(_, prop: keyof FrameworkConfig) {
      return getFrameworkConfig()[prop];
    },
  }
) as FrameworkConfig;
