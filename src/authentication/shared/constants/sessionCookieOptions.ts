// src/authentication/shared/constants/sessionCookieOptions.ts

import type { SerializeOptions } from 'cookie';

/**
 * Default cookie options applied across all auth providers.
 * Designed for secure, strict session handling.
 */
export const defaultSessionCookieOptions: SerializeOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // allow insecure for localhost/dev
  sameSite: 'strict',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // Default: 7 days in seconds
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
