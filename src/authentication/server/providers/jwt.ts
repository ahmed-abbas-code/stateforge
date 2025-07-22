// src/authentication/server/providers/jwt.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { parse, serialize } from 'cookie';
import type { JwtPayload, Algorithm } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

import { getCookieOptions } from '@authentication/shared/constants/sessionCookieOptions';
import type {
  AuthProviderInstance,
  Session,
  AuthContext,
} from '@authentication/shared/types/AuthProvider';
import { getSessionCookieName } from '@authentication/shared/utils/getSessionCookieName';

const SESSION_EXPIRES_IN_SEC = 60 * 60 * 24 * 7; // 7 days

const rawSecret = process.env.ENCRYPTION_SECRET_KEY;
if (!rawSecret || typeof rawSecret !== 'string') {
  throw new Error('ENCRYPTION_SECRET_KEY environment variable is required and must be a string');
}
const ENCRYPTION_SECRET_KEY = rawSecret;

function isJwtPayload(decoded: unknown): decoded is JwtPayload {
  return typeof decoded === 'object' && decoded !== null && 'sub' in decoded;
}

function normalizeJwtPayload(payload: JwtPayload): JwtPayload & { aud?: string } {
  return {
    ...payload,
    aud: Array.isArray(payload.aud) ? payload.aud[0] : payload.aud,
  };
}

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

export function createAuthProvider(
  instanceId: string,
  algorithms: Algorithm[] = ['HS256']
): AuthProviderInstance {
  const type = 'jwt';

  const provider: AuthProviderInstance = {
    id: instanceId,
    type,

    async signIn(
      req: NextApiRequest,
      res: NextApiResponse,
      context?: { token: string; type?: string }
    ): Promise<void> {
      try {
        const token =
          context?.token ||
          req.body?.token ||
          req.body?.access_token;

        if (!token || typeof token !== 'string') {
          res.status(400).json({ error: 'Missing or invalid token in request body' });
          return;
        }

        const decoded = jwt.verify(token, ENCRYPTION_SECRET_KEY, { algorithms });
        if (!isJwtPayload(decoded)) {
          throw new Error('Invalid JWT payload structure');
        }

        const normalized = normalizeJwtPayload(decoded);
        const expiresAt = normalized.exp ? normalized.exp * 1000 : undefined;

        const authContext: AuthContext = { req, res, existingSessions: {} };
        const cookieOpts =
          typeof provider.cookieOptions === 'function'
            ? provider.cookieOptions(authContext)
            : provider.cookieOptions;

        res.setHeader(
          'Set-Cookie',
          serialize(
            getSessionCookieName(type, instanceId),
            token,
            cookieOpts
          )
        );

        const session: Session = {
          userId: normalized.sub!,
          email: normalized.email,
          token,
          expiresAt,
          provider: type,
          providerId: instanceId,
        };

        res.status(200).json({ user: session });
      } catch (err) {
        console.error(`[${instanceId}] Sign-in failed:`, err);
        res.status(401).json({ error: 'Authentication failed' });
      }
    },

    async verifyToken(req: NextApiRequest, _res: NextApiResponse): Promise<Session | null> {
      const cookies = parse(req.headers.cookie || '');
      const cookieName = getSessionCookieName(type, instanceId);
      const rawToken = cookies[cookieName];
      if (!rawToken) return null;

      try {
        const decoded = jwt.verify(rawToken, ENCRYPTION_SECRET_KEY, { algorithms });
        if (!isJwtPayload(decoded)) {
          throw new Error('Invalid JWT payload structure');
        }

        const normalized = normalizeJwtPayload(decoded);
        const expiresAt = normalized.exp ? normalized.exp * 1000 : undefined;

        return {
          userId: normalized.sub!,
          email: normalized.email,
          token: rawToken,
          expiresAt,
          provider: type,
          providerId: instanceId,
        };
      } catch (err) {
        console.warn(`[${instanceId}] Token verification failed:`, err);
        return null;
      }
    },

    async signOut(req: NextApiRequest, res: NextApiResponse): Promise<void> {
      const authContext: AuthContext = { req, res, existingSessions: {} };
      const cookieOpts =
        typeof provider.cookieOptions === 'function'
          ? provider.cookieOptions(authContext)
          : provider.cookieOptions;

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
      const rawToken = context.req.cookies?.[cookieName];
      if (!rawToken) return null;

      try {
        const decoded = jwt.verify(rawToken, ENCRYPTION_SECRET_KEY, { algorithms });
        if (!isJwtPayload(decoded)) {
          throw new Error('Invalid JWT payload structure');
        }

        const normalized = normalizeJwtPayload(decoded);
        const expiresAt = normalized.exp ? normalized.exp * 1000 : undefined;

        return {
          userId: normalized.sub!,
          email: normalized.email,
          token: rawToken,
          expiresAt,
          provider: type,
          providerId: instanceId,
        };
      } catch (err) {
        console.warn(`[${instanceId}] Refresh token failed:`, err);
        return null;
      }
    },

    cookieOptions: buildCookieOptions(SESSION_EXPIRES_IN_SEC),
  };

  return provider;
}

// 🔹 Default instance (uses HS256)
const jwtProvider = createAuthProvider('default');

// ✅ Named exports
export const signIn = jwtProvider.signIn;
export const signOut = jwtProvider.signOut;
export const verifyToken = jwtProvider.verifyToken;
export const jwtSessionCookieName = getSessionCookieName('jwt', 'default');
