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
  secure: isProduction, // ✅ Secure cookies only in prod
  sameSite: isProduction ? 'strict' : 'lax', // ✅ Strict in prod, lax in dev
  path: '/', // ✅ Always root path
  domain: process.env.COOKIE_DOMAIN || undefined, // ✅ Match domain if configured
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

/**
 * Merges default options with custom overrides.
 * Ensures all required fields are present.
 */
export function getCookieOptions(
  overrides: Partial<SerializeOptions> = {}
): SerializeOptions {
  return {
    ...defaultSessionCookieOptions,
    ...overrides,
  };
}

/**
 * Returns options to expire a cookie immediately.
 * Used for sign-out flow to ensure cookies are fully cleared.
 */
export function getExpiredCookieOptions(
  overrides: Partial<SerializeOptions> = {}
): SerializeOptions {
  return getCookieOptions({
    expires: new Date(0), // ✅ Expired date
    maxAge: undefined, // ⚡ Remove maxAge to avoid overriding expires
    ...overrides,
  });
}
