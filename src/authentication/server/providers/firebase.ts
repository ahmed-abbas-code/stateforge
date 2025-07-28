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
import { formatSessionTTL } from '@authentication/shared/utils/formatSessionTTL';

const SESSION_EXPIRES_IN_MS = 1000 * 60 * 60 * 24 * 5; // 5 days

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

const CHECK_REVOKED = process.env.NODE_ENV === 'production';

export function createAuthProvider(instanceId: string): AuthProviderInstance {
  const type = 'firebase';
  const id = instanceId;

  const provider: AuthProviderInstance = {
    id,
    type,

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
          serialize(getSessionCookieName(type, id), sessionCookie, cookieOpts)
        );

        const expiresAt = decoded.exp ? decoded.exp * 1000 : Date.now() + SESSION_EXPIRES_IN_MS;

        const session: Session = {
          userId: decoded.uid,
          email: decoded.email,
          token: sessionCookie,
          expiresAt,
          provider: type,
          providerId: id,
          displayName: decoded.name,
        };

        if (process.env.NODE_ENV !== 'production') {
          console.debug(
            `[${id}] signIn → server time: ${new Date().toLocaleString()} | TTL: ${formatSessionTTL(expiresAt)}`
          );
        }

        res.status(200).json({ user: session });
      } catch (err) {
        console.error(`[${id}] Sign-in error:`, err);
        res.status(401).json({ error: 'Authentication failed' });
      }
    },

    async verifyToken(req) {
      const cookieName = getSessionCookieName(type, id);
      const sessionCookie = req.cookies?.[cookieName] || parse(req.headers.cookie || '')[cookieName];
      if (!sessionCookie) return null;

      try {
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, CHECK_REVOKED);
        const expiresAt = decoded.exp ? decoded.exp * 1000 : undefined;

        if (!CHECK_REVOKED && process.env.NODE_ENV !== 'production') {
          console.debug(
            `[${id}] verifyToken → server time: ${new Date().toLocaleString()} | TTL: ${formatSessionTTL(expiresAt)}`
          );
        }

        return {
          userId: decoded.uid,
          email: decoded.email,
          token: sessionCookie,
          expiresAt,
          provider: type,
          providerId: id,
          displayName: decoded.name,
        };
      } catch (err) {
        console.warn(`[${id}] Token verification failed:`, err);
        return null;
      }
    },

    async refreshToken(ctx) {
      const cookieName = getSessionCookieName(type, id);
      const sessionCookie = ctx.req.cookies?.[cookieName];
      if (!sessionCookie) return null;

      try {
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, CHECK_REVOKED);
        const expiresAt = decoded.exp ? decoded.exp * 1000 : undefined;

        if (process.env.NODE_ENV !== 'production') {
          console.debug(
            `[${id}] refreshToken → server time: ${new Date().toLocaleString()} | TTL: ${formatSessionTTL(expiresAt)}`
          );
        }

        return {
          userId: decoded.uid,
          email: decoded.email,
          token: sessionCookie,
          expiresAt,
          provider: type,
          providerId: id,
          displayName: decoded.name,
        };
      } catch (err) {
        console.warn(`[${id}] Refresh token failed:`, err);
        return null;
      }
    },

    async signOut(req, res) {
      const cookieOpts = (provider.cookieOptions as any)({ req, res, existingSessions: {} });

      res.setHeader(
        'Set-Cookie',
        serialize(getSessionCookieName(type, id), '', {
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

const firebaseProvider = createAuthProvider('firebase-default');

export const signIn = firebaseProvider.signIn;
export const signOut = firebaseProvider.signOut;
export const verifyToken = firebaseProvider.verifyToken;
export const firebaseSessionCookieName = getSessionCookieName('firebase', 'firebase-default');
