// src/authentication/server/pages/api/auth/me.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllSessions, getPrimarySession } from '@authentication/server/utils/sessionUtils';
import type { Session } from '@authentication/shared/types/AuthProvider';

type MeResponse = {
  user: Session | null;
  sessions: Record<string, Session> | null;
  error?: string;
};

/**
 * GET /api/auth/me
 * Returns the primary session and all active provider sessions.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MeResponse>
): Promise<void> {
  try {
    const sessions = await getAllSessions(req, res);

    if (!sessions || Object.keys(sessions).length === 0) {
      return res.status(401).json({
        user: null,
        sessions: null,
        error: 'No active sessions found',
      });
    }

    const primarySession = await getPrimarySession(req, res);

    return res.status(200).json({
      user: primarySession ?? null,
      sessions,
    });
  } catch (err) {
    console.error('[API] /auth/me error:', err);
    return res.status(500).json({
      user: null,
      sessions: null,
      error: 'Internal server error',
    });
  }
}
