// src/authentication/server/providers/jwt.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { parse, serialize } from 'cookie';
import type { JwtPayload } from 'jsonwebtoken';

import jwt from 'jsonwebtoken';
import {
  AuthUserType,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from '@authentication/shared';
import { mapDecodedToAuthUser } from '@authentication/server';

const SESSION_EXPIRES_IN_SEC = 60 * 60 * 24 * 7; // 7 days

const rawSecret = process.env.ENCRYPTION_SECRET_KEY;
if (!rawSecret || typeof rawSecret !== 'string') {
  throw new Error('ENCRYPTION_SECRET_KEY environment variable is required and must be a string');
}
const ENCRYPTION_SECRET_KEY: string = rawSecret;

const { verify } = jwt;

/**
 * Type guard to validate JwtPayload shape.
 */
function isJwtPayload(decoded: unknown): decoded is JwtPayload {
  return typeof decoded === 'object' && decoded !== null && 'sub' in decoded;
}

/**
 * Normalize `aud` field from array to string if needed.
 */
function normalizeJwtPayload(payload: JwtPayload): JwtPayload & { aud?: string } {
  return {
    ...payload,
    aud: Array.isArray(payload.aud) ? payload.aud[0] : payload.aud,
  };
}

/**
 * Extracts the JWT session cookie from the request.
 */
function getSessionCookie(req: NextApiRequest): string | null {
  const cookies = parse(req.headers.cookie || '');
  return cookies[SESSION_COOKIE_NAME] || null;
}

/**
 * Verifies a JWT token from the session cookie and returns an AuthUser.
 */
export async function verifyToken(req: NextApiRequest): Promise<AuthUserType> {
  const token = getSessionCookie(req);
  if (!token) throw new Error('No session cookie found');

  try {
    const decoded = verify(token, ENCRYPTION_SECRET_KEY);

    if (!isJwtPayload(decoded)) {
      throw new Error('Invalid JWT payload structure');
    }

    const normalized = normalizeJwtPayload(decoded);
    return mapDecodedToAuthUser(normalized, 'jwt');
  } catch (err) {
    console.error('[JWT] Token verification failed:', err);
    throw new Error('Invalid or expired JWT session');
  }
}

/**
 * Signs in the user by accepting a valid JWT and setting a secure session cookie.
 * Expects { token } in the request body.
 */
export async function signIn(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'Missing or invalid token in request body' });
      return;
    }

    const decoded = verify(token, ENCRYPTION_SECRET_KEY);

    if (!isJwtPayload(decoded)) {
      throw new Error('Invalid JWT payload structure');
    }

    normalizeJwtPayload(decoded); // Optional: validated but unused

    res.setHeader('Set-Cookie', serialize(SESSION_COOKIE_NAME, token, {
      ...sessionCookieOptions,
      maxAge: SESSION_EXPIRES_IN_SEC,
    }));

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[JWT] Sign-in failed:', err);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Signs the user out by clearing the session cookie.
 */
export async function signOut(_req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    res.setHeader('Set-Cookie', serialize(SESSION_COOKIE_NAME, '', {
      ...sessionCookieOptions,
      expires: new Date(0),
    }));
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[JWT] Sign-out failed:', err);
    res.status(500).json({ error: 'Sign-out failed' });
  }
}
