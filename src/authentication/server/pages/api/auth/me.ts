// src/authentication/server/pages/api/auth/me.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllSessions, getPrimarySession } from '@authentication/server/utils/sessionUtils';
import type { Session } from '@authentication/shared/types/AuthProvider';
import { jwtDecode } from 'jwt-decode';

type MeResponse = {
  user: Session | null;
  sessions: Record<string, Session>;
  isAuthenticated: boolean;
  error?: string | null;
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
        console.warn(`[ME API] Failed to decode token for ${key}:`, err);
      }
    }
    enhanced[key] = session;
  }

  return enhanced;
}

/**
 * GET /api/auth/me
 * Returns the primary session and all active provider sessions.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MeResponse>
): Promise<void> {
  try {
    const sessions = ensureExpiresAt(await getAllSessions(req, res));
    const isAuthenticated = Object.keys(sessions).length > 0;

    if (!isAuthenticated) {
      return res.status(401).json({
        user: null,
        sessions: {},
        isAuthenticated: false,
        error: 'No active sessions found',
      });
    }

    const primarySession = await getPrimarySession(req, res);

    return res.status(200).json({
      user: primarySession ?? null,
      sessions,
      isAuthenticated,
      error: null,
    });
  } catch (err) {
    console.error('[API] /auth/me error:', err);
    return res.status(500).json({
      user: null,
      sessions: {},
      isAuthenticated: false,
      error: 'Internal server error',
    });
  }
}
