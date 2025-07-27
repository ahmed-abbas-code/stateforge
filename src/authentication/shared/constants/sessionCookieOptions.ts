// src/authentication/shared/constants/sessionCookieOptions.ts

import type { SerializeOptions } from 'cookie';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Default cookie options applied across all auth providers.
 * Designed for secure, strict session handling in prod,
 * but relaxed for local development.
 */
export const defaultSessionCookieOptions: SerializeOptions = {
  httpOnly: true,
  secure: isProduction, // ✅ only secure in prod
  sameSite: isProduction ? 'strict' : 'lax', // ✅ lax in dev
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

/**
 * Merges default options with custom overrides.
 * Ensures all required fields like `maxAge` are always present.
 */
export function getCookieOptions(
  overrides: Partial<SerializeOptions> = {}
): SerializeOptions {
  return {
    ...defaultSessionCookieOptions,
    ...overrides,
  };
}

