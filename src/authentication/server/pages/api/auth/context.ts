// src/pages/api/auth/context.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from '@authentication/shared';
import { getSession } from '@authentication/server';

type ContextResponse = {
  sessions: Record<string, Session>;
  isAuthenticated: boolean;
  error: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContextResponse>
) {
  try {
    const sessions = await getSession(req, res);

    console.log('[Context API] req.cookies:', req.cookies);
    console.log('[Context API] sessions from getSession:', sessions);

    const isAuthenticated = Object.keys(sessions ?? {}).length > 0;

    return res.status(200).json({
      sessions,
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
