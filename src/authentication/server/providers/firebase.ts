// packages/authentication/server/providers/firebase.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { parse, serialize } from 'cookie';
import { adminAuth } from '@authentication/server';
import { getCookieOptions } from '@authentication/shared/constants/sessionCookieOptions';
import type {
  AuthProviderInstance,
  Session,
  AuthContext,
} from '@authentication/shared/types/AuthProvider';
import { getSessionCookieName } from '@authentication/shared/utils/getSessionCookieName';

const SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

function buildCookieOptions(maxAge: number): AuthProviderInstance['cookieOptions'] {
  return (context: AuthContext) => {
    const base = getCookieOptions({ maxAge });

    return {
      maxAge,
      httpOnly: base.httpOnly ?? true,
      secure: base.secure ?? true,
      sameSite:
        base.sameSite === 'lax' || base.sameSite === 'strict' || base.sameSite === 'none'
          ? base.sameSite
          : 'strict',
      path: base.path ?? '/',
    };
  };
}

export function createAuthProvider(instanceId: string): AuthProviderInstance {
  const type = 'firebase';

  return {
    id: instanceId,
    type,

    async signIn(req: NextApiRequest, res: NextApiResponse): Promise<void> {
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

        const context: AuthContext = { req, res, existingSessions: {} };
        const cookieOpts = typeof firebaseProvider.cookieOptions === 'function'
          ? firebaseProvider.cookieOptions(context)
          : firebaseProvider.cookieOptions;

        res.setHeader(
          'Set-Cookie',
          serialize(
            getSessionCookieName(type, instanceId),
            sessionCookie,
            cookieOpts
          )
        );

        const expiresAt = decoded.exp ? decoded.exp * 1000 : Date.now() + SESSION_EXPIRES_IN_MS;

        const user: Session = {
          userId: decoded.uid,
          email: decoded.email,
          token: sessionCookie,
          expiresAt,
          provider: type,
          providerId: instanceId,
          displayName: decoded.name,
        };

        res.status(200).json({ user });
      } catch (err) {
        console.error(`[${instanceId}] Sign-in error:`, err);
        res.status(401).json({ error: 'Authentication failed' });
      }
    },

    async verifyToken(req: NextApiRequest, _res: NextApiResponse): Promise<Session | null> {
      const cookies = parse(req.headers.cookie || '');
      const cookieName = getSessionCookieName(type, instanceId);
      const sessionCookie = cookies[cookieName];
      if (!sessionCookie) return null;

      try {
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
        const expiresAt = decoded.exp ? decoded.exp * 1000 : undefined;

        return {
          userId: decoded.uid,
          email: decoded.email,
          token: sessionCookie,
          expiresAt,
          provider: type,
          providerId: instanceId,
          displayName: decoded.name,
        };
      } catch (err) {
        console.warn(`[${instanceId}] Token verification failed:`, err);
        return null;
      }
    },

    async signOut(req: NextApiRequest, res: NextApiResponse) {
      const context: AuthContext = { req, res, existingSessions: {} };
      const cookieOpts = typeof firebaseProvider.cookieOptions === 'function'
        ? firebaseProvider.cookieOptions(context)
        : firebaseProvider.cookieOptions;

      res.setHeader(
        'Set-Cookie',
        serialize(
          getSessionCookieName(type, instanceId),
          '',
          { ...cookieOpts, maxAge: -1 }
        )
      );
      res.status(200).json({ ok: true });
    },

    async refreshToken(context: AuthContext): Promise<Session | null> {
      const cookieName = getSessionCookieName(type, instanceId);
      const sessionCookie = context.req.cookies?.[cookieName];

      if (!sessionCookie) return null;

      try {
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
        const expiresAt = decoded.exp ? decoded.exp * 1000 : undefined;

        return {
          userId: decoded.uid,
          email: decoded.email,
          token: sessionCookie,
          expiresAt,
          provider: type,
          providerId: instanceId,
          displayName: decoded.name,
        };
      } catch (err) {
        console.warn(`[${instanceId}] Refresh token failed:`, err);
        return null;
      }
    },

    cookieOptions: buildCookieOptions(SESSION_EXPIRES_IN_MS / 1000),
  };
}

// 🔹 Default instance for convenience
const firebaseProvider = createAuthProvider('default');

// ✅ Named exports for index.ts
export const signIn = firebaseProvider.signIn;
export const signOut = firebaseProvider.signOut;
export const verifyToken = firebaseProvider.verifyToken;
export const firebaseSessionCookieName = getSessionCookieName('firebase', 'default');
