// src/authentication/server/pages/api/auth/me.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthContextResponse, buildAuthContextResponse } from '@authentication/server';

/**
 * GET /api/auth/me
 * Returns the primary session (JWT preferred) and all active provider sessions.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthContextResponse>
): Promise<void> {
  try {
    // Only return the primary user (JWT preferred), not all sessions
    const response = await buildAuthContextResponse(req, res, { returnAll: false });

    if (!response.isAuthenticated) {
      return res.status(401).json({
        ...response,
        error: 'Session expired or not authenticated',
      });
    }

    return res.status(200).json(response);
  } catch (err: any) {
    console.error('[API] /auth/me error:', err);

    return res.status(500).json({
      sessions: {},
      isAuthenticated: false,
      user: null,
      error: err?.message || 'Internal server error',
    });
  }
}
