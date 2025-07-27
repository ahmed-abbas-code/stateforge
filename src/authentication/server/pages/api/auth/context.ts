// src/pages/api/auth/context.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@authentication/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sessions = await getSession(req, res);
    const isAuthenticated = Object.keys(sessions).length > 0;

    return res.status(200).json({
      sessions,                // Keyed by instanceId (e.g., 'firebase', 'jwt', etc.)
      isAuthenticated,         // Global flag based on session presence
      error: null,             // Explicit null when no error
    });
  } catch (error: any) {
    console.error('[Context API] Failed to load sessions:', error);

    return res.status(500).json({
      sessions: {},            // Return empty map on error
      isAuthenticated: false, // Auth is false on failure
      error: error?.message || 'Failed to load session context',
    });
  }
}
