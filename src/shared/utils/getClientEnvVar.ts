// packages/shared/utils/getClientEnvVar.ts

import { PublicEnvVar } from "../types/env";

export function getClientEnvVar(name: PublicEnvVar): string {
  const value =
    (typeof process !== 'undefined' && process.env?.[name]) ||
    (typeof window !== 'undefined' && window.__SF_ENV?.[name]);

  if (!value) {
    const message = `[Env] Missing required public environment variable: ${name}`;
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn(message);
    }
    throw new Error(message);
  }

  return value;
}
