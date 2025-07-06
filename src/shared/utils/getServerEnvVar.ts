// packages/shared/utils/getServerEnvVar.ts

import { PrivateEnvVar } from '../types/env';

/**
 * Access server-only environment variables safely.
 * Throws immediately if executed in a browser environment.
 */
export function getServerEnvVar(name: PrivateEnvVar): string {
  // Block client-side execution early
  if (typeof window !== 'undefined') {
    const errorMsg = `[getServerEnvVar] Server-only variable "${name}" was accessed on the client. This is a critical misuse.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const value = process.env?.[name];

  if (!value) {
    throw new Error(`[getServerEnvVar] Missing required server env var: "${name}"`);
  }

  return value;
}
