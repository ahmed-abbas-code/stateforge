// src/authentication/server/providers/auth0.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import type {
  AuthProviderInstance,
  Session,
  AuthContext,
} from '@authentication/shared/types/AuthProvider';
import { getCookieOptions } from '@authentication/shared/constants/sessionCookieOptions';
import { getSessionCookieName } from '@authentication/shared/utils/getSessionCookieName';

const SESSION_EXPIRES_IN_SEC = 60 * 60 * 24 * 7; // 7 days

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
  const type = 'auth0';

  return {
    id: instanceId,
    type,

    /**
     * Not yet implemented — typically handled client-side via redirect
     */
    async signIn(_req: NextApiRequest, _res: NextApiResponse): Promise<void> {
      throw new Error(`[${instanceId}] signIn not implemented`);
    },

    /**
     * Verifies the Auth0 ID token (if provided via cookie/session).
     */
    async verifyToken(_req: NextApiRequest, _res: NextApiResponse): Promise<Session | null> {
      throw new Error(`[${instanceId}] verifyToken not implemented`);
    },

    /**
     * Signs the user out by clearing the Auth0 session (if applicable).
     */
    async signOut(_req: NextApiRequest, _res: NextApiResponse): Promise<void> {
      throw new Error(`[${instanceId}] signOut not implemented`);
    },

    /**
     * Refreshes the Auth0 session (e.g., via silent auth or refresh token).
     */
    async refreshToken(_context: AuthContext): Promise<Session | null> {
      throw new Error(`[${instanceId}] refreshToken not implemented`);
    },

    cookieOptions: buildCookieOptions(SESSION_EXPIRES_IN_SEC),
  };
}

// 🔹 Default instance for convenience
const defaultAuth0Provider = createAuthProvider('default');

// ✅ Named exports for index.ts
export const signIn = defaultAuth0Provider.signIn;
export const signOut = defaultAuth0Provider.signOut;
export const verifyToken = defaultAuth0Provider.verifyToken;
export const auth0SessionCookieName = getSessionCookieName('auth0', 'default');
