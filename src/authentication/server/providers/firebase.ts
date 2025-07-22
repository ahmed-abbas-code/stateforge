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
  return (_ctx: AuthContext) => {
    const base = getCookieOptions({ maxAge });

    return {
      maxAge,
      httpOnly: base.httpOnly ?? true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: base.path ?? '/',
    };
  };
}

export function createAuthProvider(instanceId: string): AuthProviderInstance {
  const type = 'firebase';

  const provider: AuthProviderInstance = {
    id: instanceId,
    type,

    async signIn(req: NextApiRequest, res: NextApiResponse, context?: { token: string; type?: string }) {
      const idToken =
        context?.token ||
        req.body?.token ||
        req.body?.idToken ||
        req.body?.id_token;

      if (!idToken || typeof idToken !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid idToken in request body' });
      }

      try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        const sessionCookie = await adminAuth.createSessionCookie(idToken, {
          expiresIn: SESSION_EXPIRES_IN_MS,
        });

        const cookieOpts = (provider.cookieOptions as any)({ req, res, existingSessions: {} });

        res.setHeader(
          'Set-Cookie',
          serialize(getSessionCookieName(type, instanceId), sessionCookie, cookieOpts)
        );

        const expiresAt = decoded.exp ? decoded.exp * 1000 : Date.now() + SESSION_EXPIRES_IN_MS;

        const session: Session = {
          userId: decoded.uid,
          email: decoded.email,
          token: sessionCookie,
          expiresAt,
          provider: type,
          providerId: instanceId,
          displayName: decoded.name,
        };

        res.status(200).json({ user: session });
      } catch (err) {
        console.error(`[${instanceId}] Sign-in error:`, err);
        res.status(401).json({ error: 'Authentication failed' });
      }
    },

    async verifyToken(req: NextApiRequest): Promise<Session | null> {
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
      const cookieOpts = (provider.cookieOptions as any)({ req, res, existingSessions: {} });

      res.setHeader(
        'Set-Cookie',
        serialize(getSessionCookieName(type, instanceId), '', {
          ...cookieOpts,
          maxAge: -1,
        })
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

  return provider;
}

// 🔹 Default instance
const firebaseProvider = createAuthProvider('default');

export const signIn = firebaseProvider.signIn;
export const signOut = firebaseProvider.signOut;
export const verifyToken = firebaseProvider.verifyToken;
export const firebaseSessionCookieName = getSessionCookieName('firebase', 'default');
