// packages/core/src/common/utils/getRequiredEnv.ts
import type { PublicEnvKey } from '../types/env';

export function getRequiredEnv(name: PublicEnvKey): string {
  const value =
    (typeof process !== 'undefined' && process.env?.[name]) ||
    (typeof window !== 'undefined' && window.__SF_ENV?.[name]);

  if (!value) {
    throw new Error(`[Env] Missing required environment variable: ${name}`);
  }
  return value;
}
