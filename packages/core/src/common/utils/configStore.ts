// packages/core/src/common/utils/configStore.ts
import { z } from 'zod';
import { envSchema } from '../types/validation/envSchema';

type BaseEnv = z.infer<typeof envSchema>;
export type FrameworkConfig = BaseEnv & { isDryRun: boolean };

let cached: FrameworkConfig | null = null;

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

export function getFrameworkConfig(): FrameworkConfig {
  if (!cached) throw new Error('Call setupStateForgeConfig() first');
  return cached;
}

// ✅ Optional convenience export for shared usage
export const config: FrameworkConfig = setupStateForgeConfig();
