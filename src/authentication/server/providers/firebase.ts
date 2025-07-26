// src/authentication/server/providers/firebase.ts

'use server';

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

const SESSION_EXPIRES_IN_MS = 1000 * 60 * 60 * 24 * 5; // 5 days

/* ────────────────────────────────────────────────────────── */
/* Helpers                                                   */
/* ────────────────────────────────────────────────────────── */

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

/** Should we ask Firebase to check if the session cookie was revoked? */
const CHECK_REVOKED = process.env.NODE_ENV === 'production';

/* ────────────────────────────────────────────────────────── */
/* Factory                                                   */
/* ────────────────────────────────────────────────────────── */

export function createAuthProvider(instanceId: string): AuthProviderInstance {
  const type = 'firebase';

  const provider: AuthProviderInstance = {
    id: instanceId,
    type,

    /* -------------  SIGN-IN ------------- */
    async signIn(req, res, context) {
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

    /* -------------  VERIFY TOKEN ------------- */
    async verifyToken(req) {
      const cookieName = getSessionCookieName(type, instanceId);
      const sessionCookie = parse(req.headers.cookie || '')[cookieName];
      if (!sessionCookie) return null;

      try {
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, CHECK_REVOKED);
        if (!CHECK_REVOKED) {
          console.debug(`[${instanceId}] Session verified without revocation check (dev mode).`);
        }

        return {
          userId: decoded.uid,
          email: decoded.email,
          token: sessionCookie,
          expiresAt: decoded.exp ? decoded.exp * 1000 : undefined,
          provider: type,
          providerId: instanceId,
          displayName: decoded.name,
        };
      } catch (err) {
        console.warn(`[${instanceId}] Token verification failed:`, err);
        return null;
      }
    },

    /* -------------  REFRESH TOKEN ------------- */
    async refreshToken(ctx) {
      const cookieName = getSessionCookieName(type, instanceId);
      const sessionCookie = ctx.req.cookies?.[cookieName];
      if (!sessionCookie) return null;

      try {
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, CHECK_REVOKED);
        return {
          userId: decoded.uid,
          email: decoded.email,
          token: sessionCookie,
          expiresAt: decoded.exp ? decoded.exp * 1000 : undefined,
          provider: type,
          providerId: instanceId,
          displayName: decoded.name,
        };
      } catch (err) {
        console.warn(`[${instanceId}] Refresh token failed:`, err);
        return null;
      }
    },

    /* -------------  SIGN-OUT ------------- */
    async signOut(req, res) {
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

    cookieOptions: buildCookieOptions(SESSION_EXPIRES_IN_MS / 1000),
  };

  return provider;
}

/* ────────────────────────────────────────────────────────── */
/* Default instance export                                    */
/* ────────────────────────────────────────────────────────── */
const firebaseProvider = createAuthProvider('default');

export const signIn = firebaseProvider.signIn;
export const signOut = firebaseProvider.signOut;
export const verifyToken = firebaseProvider.verifyToken;
export const firebaseSessionCookieName = getSessionCookieName('firebase', 'default');
