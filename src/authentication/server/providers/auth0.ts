// src/authentication/server/providers/auth0.ts

'use server';

import type { NextApiRequest, NextApiResponse } from 'next';
import type {
  AuthProviderInstance,
  Session,
  AuthContext,
} from '@authentication/shared/types/AuthProvider';

import { getCookieOptions } from '@authentication/shared/constants/sessionCookieOptions';
import { getSessionCookieName } from '@authentication/shared/utils/getSessionCookieName';

const SESSION_EXPIRES_IN_SEC = 60 * 60 * 24 * 7; // 7 days

/* ────────────────────────────────────────────────────────── */
/* Helpers                                                   */
/* ────────────────────────────────────────────────────────── */

const buildCookieOptions = (maxAge: number): AuthProviderInstance['cookieOptions'] => {
  return () => {
    const base = getCookieOptions({ maxAge });
    return {
      maxAge,
      httpOnly: base.httpOnly ?? true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: base.path ?? '/',
    };
  };
};

/* ────────────────────────────────────────────────────────── */
/* Factory                                                   */
/* ────────────────────────────────────────────────────────── */

export function createAuthProvider(instanceId: string): AuthProviderInstance {
  const type = 'auth0';
  const id = instanceId;

  return {
    id,
    type,

    /* ---------------- SIGN-IN (TODO) ---------------- */
    async signIn(_req: NextApiRequest, _res: NextApiResponse, _ctx?: { token: string }) {
      throw new Error(`[auth0:${id}] signIn not implemented`);
    },

    /* -------------- VERIFY TOKEN (TODO) ------------- */
    async verifyToken(_req: NextApiRequest): Promise<Session | null> {
      throw new Error(`[auth0:${id}] verifyToken not implemented`);
    },

    /* -------------- SIGN-OUT (TODO) ----------------- */
    async signOut(_req: NextApiRequest, _res: NextApiResponse) {
      throw new Error(`[auth0:${id}] signOut not implemented`);
    },

    /* ------------ REFRESH TOKEN (TODO) -------------- */
    async refreshToken(_ctx: AuthContext): Promise<Session | null> {
      throw new Error(`[auth0:${id}] refreshToken not implemented`);
    },

    cookieOptions: buildCookieOptions(SESSION_EXPIRES_IN_SEC),
  };
}

/* ────────────────────────────────────────────────────────── */
/* Default instance & named exports                          */
/* ────────────────────────────────────────────────────────── */

const defaultAuth0Provider = createAuthProvider('default');

export const signIn = defaultAuth0Provider.signIn;
export const signOut = defaultAuth0Provider.signOut;
export const verifyToken = defaultAuth0Provider.verifyToken;
export const auth0SessionCookieName = getSessionCookieName('auth0', 'default');
