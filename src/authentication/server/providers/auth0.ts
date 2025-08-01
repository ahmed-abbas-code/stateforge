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
import { formatSessionTTL } from '@authentication/shared/utils/formatSessionTTL';

const SESSION_EXPIRES_IN_SEC = 60 * 60 * 24 * 7; // 7 days
const SESSION_EXPIRES_IN_MS = SESSION_EXPIRES_IN_SEC * 1000; // ✅ consistent with Firebase

/* ────────────────────────────────────────────────────────── */
/* Helpers                                                   */
/* ────────────────────────────────────────────────────────── */

const buildCookieOptions = (maxAge: number): AuthProviderInstance['cookieOptions'] => {
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

    async signIn(_req: NextApiRequest, _res: NextApiResponse, _ctx?: { token: string }) {
      const now = new Date();
      console.warn(
        `[${type}:${id}] signIn called at ${now.toLocaleString()} (${Date.now()}) — not implemented`
      );
      throw new Error(`[${type}:${id}] signIn not implemented`);
    },

    async verifyToken(_req: NextApiRequest): Promise<Session | null> {
      const now = new Date();
      console.warn(
        `[${type}:${id}] verifyToken called at ${now.toLocaleString()} (${Date.now()}) — not implemented`
      );
      throw new Error(`[${type}:${id}] verifyToken not implemented`);
    },

    async signOut(_req: NextApiRequest, _res: NextApiResponse) {
      console.warn(`[${type}:${id}] signOut called — not implemented`);
      throw new Error(`[${type}:${id}] signOut not implemented`);
    },

    async refreshToken(_ctx: AuthContext): Promise<Session | null> {
      console.warn(`[${type}:${id}] refreshToken called — not implemented`);
      throw new Error(`[${type}:${id}] refreshToken not implemented`);
    },

    // ✅ Ensure cookie options use seconds, but sessions use ms consistently
    cookieOptions: buildCookieOptions(SESSION_EXPIRES_IN_SEC),
  };
}

/* ────────────────────────────────────────────────────────── */
/* Default instance & named exports                          */
/* ────────────────────────────────────────────────────────── */

const defaultAuth0Provider = createAuthProvider('auth0-default');

export const signIn = defaultAuth0Provider.signIn;
export const signOut = defaultAuth0Provider.signOut;
export const verifyToken = defaultAuth0Provider.verifyToken;
export const auth0SessionCookieName = getSessionCookieName('auth0', 'auth0-default');
