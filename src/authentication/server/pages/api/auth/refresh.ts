// src/authentication/server/pages/api/auth/refresh.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { refreshSessions, getPrimarySession } from '@authentication/server/utils/sessionUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const sessions = await refreshSessions(req, res);
    const isAuthenticated = Object.keys(sessions).length > 0;

    if (!isAuthenticated) {
      return res.status(401).json({
        user: null,
        sessions: {},
        isAuthenticated: false,
        error: 'No sessions refreshed',
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
