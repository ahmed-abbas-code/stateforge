// packages/core/src/common/utils/getServerEnv.ts
import type { PrivateEnvKey } from '../types/env';

export function getServerEnv(name: PrivateEnvKey): string {
  const value =
    (typeof process !== 'undefined' && process.env?.[name])
  if (!value) {
    throw new Error(`[Env] Missing server environment variable: ${name}`);
  }
  return value;
}
