// packages/shared/utils/getClientEnvVar.ts

import { PublicEnvVar } from "../types/env";

export function getClientEnvVar(name: PublicEnvVar): string {
  if (typeof window === 'undefined') {
    throw new Error(`[getClientEnvVar] Tried to read '${name}' in a non-browser context`);
  }

  const value = window.__SF_ENV?.[name];

  if (!value) {
    const message = `[Env] Missing required public environment variable: ${name}`;
    if (process.env.NODE_ENV === 'development') {
      console.warn(message);
    }
    throw new Error(message);
  }

  return value;
}
