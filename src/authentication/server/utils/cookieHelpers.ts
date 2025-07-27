// src/authentication/server/utils/cookieHelpers.ts

import { serialize, type SerializeOptions } from 'cookie';
import { AuthProviderInstance, AuthContext } from '@authentication/shared/types/AuthProvider';
import { getSessionCookieName } from '@authentication/shared/utils/getSessionCookieName';

function resolveCookieOptions(
  provider: AuthProviderInstance,
  context: AuthContext
): SerializeOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  const fallback: SerializeOptions = {
    httpOnly: true,
    secure: isProduction, // ✅ only secure in production
    sameSite: isProduction ? 'strict' : 'lax', // ✅ more permissive in dev
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };

  const raw = typeof provider.cookieOptions === 'function'
    ? provider.cookieOptions(context)
    : provider.cookieOptions;

  if (!raw) return fallback;

  const sameSite: SerializeOptions['sameSite'] =
    raw.sameSite === 'lax' || raw.sameSite === 'strict' || raw.sameSite === 'none'
      ? raw.sameSite
      : fallback.sameSite;

  return {
    ...fallback,
    ...raw,
    secure: raw.secure ?? fallback.secure, // ✅ preserve override or fallback
    sameSite, // ✅ always use validated value
  };
}

export function setAuthCookie(
  res: { setHeader: Function },
  provider: AuthProviderInstance,
  token: string,
  context: AuthContext
): void {
  const cookieName = getSessionCookieName(provider.type, provider.id);
  const options = resolveCookieOptions(provider, context);
  res.setHeader('Set-Cookie', serialize(cookieName, token, options));
}

export function clearAuthCookie(
  res: { setHeader: Function },
  provider: AuthProviderInstance,
  context: AuthContext
): void {
  const cookieName = getSessionCookieName(provider.type, provider.id);
  const baseOptions = resolveCookieOptions(provider, context);
  res.setHeader(
    'Set-Cookie',
    serialize(cookieName, '', { ...baseOptions, maxAge: -1 })
  );
}
