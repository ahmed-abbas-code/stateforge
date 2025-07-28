// src/pages/api/auth/context.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from '@authentication/shared';
import { getSession } from '@authentication/server';
import { jwtDecode } from 'jwt-decode';

type ContextResponse = {
  sessions: Record<string, Session>;
  isAuthenticated: boolean;
  error: string | null;
};

type TokenPayload = {
  exp?: number;
};

function ensureExpiresAt(sessions: Record<string, Session>): Record<string, Session> {
  const enhanced: Record<string, Session> = {};

  for (const [key, session] of Object.entries(sessions)) {
    if (!session.expiresAt && session.token) {
      try {
        const payload = jwtDecode<TokenPayload>(session.token);
        if (payload.exp) {
          session.expiresAt = payload.exp * 1000;
        }
      } catch (err) {
        console.warn(`[Context API] Failed to decode token for ${key}:`, err);
      }
    }
    enhanced[key] = session;
  }

  return enhanced;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContextResponse>
) {
  try {
    const sessions = await getSession(req, res);
    const sessionsWithExpiry = ensureExpiresAt(sessions);

    console.log('[Context API] req.cookies:', req.cookies);
    console.log('[Context API] sessions from getSession:', sessionsWithExpiry);

    const isAuthenticated = Object.keys(sessionsWithExpiry).length > 0;

    return res.status(200).json({
      sessions: sessionsWithExpiry,
      isAuthenticated,
      error: null,
    });
  } catch (error: any) {
    console.error('[Context API] Failed to load sessions:', error);

    return res.status(500).json({
      sessions: {},
      isAuthenticated: false,
      error: error?.message || 'Failed to load session context',
    });
  }
}
