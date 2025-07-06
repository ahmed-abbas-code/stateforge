// packages/authentication/server/providers/auth0.ts
import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { AuthUser } from "@authentication/auth/shared";
import type { NextApiRequest, NextApiResponse } from "next";

export const auth0 = new Auth0Client();

/**
 * Returns the authenticated user.
 */
export async function verifyToken(req: NextApiRequest): Promise<AuthUser> {
  const session = await auth0.getSession(req);
  if (!session?.user) throw new Error("Auth0 session invalid or expired");

  const { sub, email, name, nickname } = session.user;

  return {
    uid: sub,
    email: email ?? '',
    displayName: name ?? nickname ?? undefined,
    provider: 'auth0',
    providerId: 'auth0',
  };
}

/**
 * Redirects to the Auth0 login page.
 */
export async function signIn(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const returnTo = process.env.AUTH0_POST_LOGIN_REDIRECT || '/';
  res.writeHead(302, {
    Location: `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`,
  });
  res.end();
}

/**
 * Redirects to the Auth0 logout page.
 */
export async function signOut(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const returnTo = process.env.AUTH0_POST_LOGOUT_REDIRECT || '/';
  res.writeHead(302, {
    Location: `/api/auth/logout?returnTo=${encodeURIComponent(returnTo)}`,
  });
  res.end();
}
