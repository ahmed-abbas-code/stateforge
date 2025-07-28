// src/authentication/server/pages/api/auth/refresh.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { refreshSessions, getPrimarySession } from '@authentication/server/utils/sessionUtils';
import { jwtDecode } from 'jwt-decode';

type TokenPayload = {
  exp?: number;
};

function ensureExpiresAt(sessions: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, session] of Object.entries(sessions)) {
    if (!session.expiresAt && session.token) {
      try {
        const decoded = jwtDecode<TokenPayload>(session.token);
        if (decoded.exp) {
          session.expiresAt = decoded.exp * 1000;
        }
      } catch (err) {
        console.warn(`[Refresh API] Failed to decode token for ${key}:`, err);
      }
    }
    result[key] = session;
  }

  return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const rawSessions = await refreshSessions(req, res);
    const sessions = ensureExpiresAt(rawSessions);
    const isAuthenticated = Object.keys(sessions).length > 0;

    if (!isAuthenticated) {
      return res.status(401).json({
        user: null,
        sessions: {},
        isAuthenticated: false,
        error: 'No active sessions found',
      });
    }

    const user = await getPrimarySession(req, res);

    return res.status(200).json({
      user,
      sessions,
      isAuthenticated,
      error: null,
    });
  } catch (err) {
    console.error('Error during session refresh:', err);
    return res.status(500).json({
      user: null,
      sessions: {},
      isAuthenticated: false,
      error: 'Internal Server Error',
    });
  }
}
