// packages/authentication/server/providers/firebase.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { parse, serialize } from 'cookie';
import { adminAuth, mapDecodedToAuthUser } from '@authentication/server';
import { AuthUserType, SF_USER_SESSION_COOKIE_NAME, sessionCookieOptions } from '@authentication/shared';

const SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

/**
 * Extracts the Firebase session cookie from the request.
 */
function getSessionCookie(req: NextApiRequest): string | null {
  const cookies = parse(req.headers.cookie || '');
  return cookies[SF_USER_SESSION_COOKIE_NAME] || null;
}

/**
 * Verifies a Firebase session cookie and returns the authenticated user.
 */
export async function verifyToken(req: NextApiRequest): Promise<AuthUserType> {
  const sessionCookie = getSessionCookie(req);
  if (!sessionCookie) {
    // Unauthenticated (no cookie) — don’t log this as an error
    throw new Error('No session cookie found');
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return mapDecodedToAuthUser(decoded, 'firebase');
  } catch (error: unknown) {
    // Only log truly unexpected failures
    if (error instanceof Error && error.message !== 'No session cookie found') {
      console.error('[Firebase] Session cookie verification failed:', error);
    }
    throw new Error('Invalid or expired Firebase session');
  }
}

/**
 * Signs in the user by exchanging an ID token for a session cookie.
 * Expects { idToken } in req.body.
 */
export async function signIn(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { idToken } = req.body;

  if (!idToken || typeof idToken !== 'string') {
    res.status(400).json({ error: 'Missing or invalid idToken in request body' });
    return;
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    });

    res.setHeader('Set-Cookie', serialize(SF_USER_SESSION_COOKIE_NAME, sessionCookie, {
      ...sessionCookieOptions,
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
    }));

    const user: AuthUserType = mapDecodedToAuthUser(decoded, 'firebase');
    res.status(200).json({ user });
  } catch (err) {
    console.error('[Firebase] Sign-in error:', err);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Signs out the user by clearing the session cookie.
 */
export async function signOut(_req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    res.setHeader('Set-Cookie', serialize(SF_USER_SESSION_COOKIE_NAME, '', {
      ...sessionCookieOptions,
      expires: new Date(0),
    }));
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[Firebase] Sign-out error:', err);
    res.status(500).json({ error: 'Sign-out failed' });
  }
}
