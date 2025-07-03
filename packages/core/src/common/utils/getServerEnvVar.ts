// packages/core/src/common/utils/getServerEnvVar.ts

import { PrivateEnvVar } from "@core/common/types/env";

/**
 * Safely access server-only environment variables.
 * Throws if accessed from the browser or if missing.
 */
export function getServerEnvVar(name: PrivateEnvVar): string {
  if (typeof window !== 'undefined') {
    const message = `[Env] Attempted to access server-only variable '${name}' in the browser`;
    if (process.env.NODE_ENV === 'development') {
      console.warn(message);
    }
    throw new Error(message);
  }

  const value = process.env?.[name];
  if (!value) {
    throw new Error(`[Env] Missing server environment variable: ${name}`);
  }

  return value;
}
