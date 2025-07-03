// packages/core/src/common/utils/getClientFrameworkConfig.ts
import { envPublicSchema } from '../types/validation/envSchema';
import type { PublicEnvVars } from '../types/validation/envSchema';

let cached: PublicEnvVars | null = null;

export function getClientFrameworkConfig(): PublicEnvVars {
  if (cached) return cached;

  const env =
    typeof window !== 'undefined' && window.__SF_ENV
      ? window.__SF_ENV
      : {};

  const parsed = envPublicSchema.safeParse(env);
  if (!parsed.success) {
    console.error('❌ ENV PARSE FAILED (client):', parsed.error.format());
    throw new Error('Invalid client-side environment config');
  }

  cached = parsed.data;
  return cached;
}
