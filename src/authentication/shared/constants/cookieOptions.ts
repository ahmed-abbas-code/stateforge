// packages/authentication/shared/constants/cookieOptions.ts

export const SESSION_COOKIE_NAME = 'session';

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};
