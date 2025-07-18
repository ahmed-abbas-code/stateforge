// packages/authentication/shared/constants/cookieOptions.ts

export const SF_USER_SESSION_COOKIE_NAME = 'user-session';
export const SF_BACKEND_SESSION_COOKIE_NAME = 'backend-session';

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};
