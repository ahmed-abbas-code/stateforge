// src/authentication/server/providers/jwt.ts

'use server';

import type { NextApiRequest, NextApiResponse } from 'next';
import { parse, serialize } from 'cookie';
import jwt, { type JwtPayload, type Algorithm } from 'jsonwebtoken';

import { getCookieOptions } from '@authentication/shared/constants/sessionCookieOptions';
import type {
  AuthProviderInstance,
  Session,
  AuthContext,
} from '@authentication/shared/types/AuthProvider';
import { getSessionCookieName } from '@authentication/shared/utils/getSessionCookieName';

const SESSION_EXPIRES_IN_SEC = 60 * 60 * 24 * 7; // 7 days

/* ────────────────────────────────────────────────────────── */
/* Helpers                                                   */
/* ────────────────────────────────────────────────────────── */

function decodeJwt(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token);
    return typeof decoded === 'object' && decoded !== null ? decoded : null;
  } catch {
    return null;
  }
}

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

/* ────────────────────────────────────────────────────────── */
/* Factory                                                   */
/* ────────────────────────────────────────────────────────── */

export function createAuthProvider(
  instanceId: string,
  _algorithms?: Algorithm[]      // ready for future signature-check
): AuthProviderInstance {
  const type = 'jwt';

  /* Re-usable helper to convert a decoded payload into a Session */
  const payloadToSession = (payload: JwtPayload, token: string): Session | null => {
    // Accept either "sub" or "user_id"
    const rawId = payload.sub ?? payload.user_id;
    if (rawId === undefined || rawId === null) return null;
    const userId = typeof rawId === 'number' ? String(rawId) : String(rawId);

    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[jwt:${instanceId}] Using user id from ${payload.sub ? 'sub' : 'user_id'} → ${userId}`);
    }

    return {
      userId,
      email: payload.email,
      token,
      expiresAt: payload.exp ? payload.exp * 1000 : undefined,
      provider: type,
      providerId: instanceId,
    };
  };

  const provider: AuthProviderInstance = {
    id: instanceId,
    type,

    /* -------- SIGN-IN -------- */
    async signIn(req: NextApiRequest, res: NextApiResponse, ctx?: { token: string }) {
      const token =
        ctx?.token ||
        req.body?.token ||
        req.body?.access_token;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid token' });
      }

      const payload = decodeJwt(token);
      if (!payload) {
        return res.status(401).json({ error: 'Invalid JWT payload' });
      }

      const session = payloadToSession(payload, token);
      if (!session) {
        return res.status(401).json({ error: 'Invalid JWT payload structure' });
      }

      const cookieOpts = (provider.cookieOptions as any)({ req, res, existingSessions: {} });

      res.setHeader(
        'Set-Cookie',
        serialize(getSessionCookieName(type, instanceId), token, cookieOpts)
      );

      res.status(200).json({ user: session });
    },

    /* -------- VERIFY TOKEN -------- */
    async verifyToken(req: NextApiRequest): Promise<Session | null> {
      const cookieName = getSessionCookieName(type, instanceId);
      const token = parse(req.headers.cookie || '')[cookieName];
      if (!token) return null;

      const payload = decodeJwt(token);
      if (!payload) return null;

      return payloadToSession(payload, token);
    },

    /* -------- REFRESH TOKEN -------- */
    async refreshToken(ctx: AuthContext): Promise<Session | null> {
      const cookieName = getSessionCookieName(type, instanceId);
      const token = ctx.req.cookies?.[cookieName];
      if (!token) return null;

      const payload = decodeJwt(token);
      if (!payload) return null;

      return payloadToSession(payload, token);
    },

    /* -------- SIGN-OUT -------- */
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

    cookieOptions: buildCookieOptions(SESSION_EXPIRES_IN_SEC),
  };

  return provider;
}

/* ────────────────────────────────────────────────────────── */
/* Default instance & exports                                */
/* ────────────────────────────────────────────────────────── */

const jwtProvider = createAuthProvider('default');

export const signIn              = jwtProvider.signIn;
export const signOut             = jwtProvider.signOut;
export const verifyToken         = jwtProvider.verifyToken;
export const jwtSessionCookieName = getSessionCookieName('jwt', 'default');
