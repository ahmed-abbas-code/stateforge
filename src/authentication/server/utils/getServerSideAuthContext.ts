// src/authentication/server/utils/getServerSideAuthContext.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionCookieName } from '../../shared/utils/getSessionCookieName';
import { parseCookies } from 'nookies';
import { getAuthProviderInstances } from '@authentication/server/utils/authRegistry';
import { AuthContext, Session } from '@authentication/shared/types/AuthProvider';

export async function getServerSideAuthContext(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{
  sessions: Record<string, Session>;
  authContext: AuthContext;
}> {
  const sessions: Record<string, Session> = {};
  const providers = getAuthProviderInstances();
  const cookies = parseCookies({ req });

  for (const [id, provider] of Object.entries(providers)) {
    const cookieName = getSessionCookieName(provider.type, id);
    const token = cookies[cookieName];
    if (!token) continue;

    const session = await provider.verifyToken(req, res);
    if (session) {
      const context: AuthContext = { req, res, existingSessions: { ...sessions } };
      sessions[id] = provider.onVerifySuccess
        ? await provider.onVerifySuccess(session, context)
        : session;
    }
  }

  return {
    sessions,
    authContext: {
      req,
      res,
      existingSessions: sessions,
    },
  };
}
