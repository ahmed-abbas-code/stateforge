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
          session.expiresAt = payload.exp * 1000; // convert to ms
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
    // 🔑 Add toggle via query param ?all=true
    const returnAll = req.query.all === 'true';

    // getSession should already collect sessions via AuthenticationChain
    const sessions = await getSession(req, res);
    const sessionsWithExpiry = ensureExpiresAt(sessions);

    console.log('[Context API] req.cookies:', req.cookies);
    console.log('[Context API] sessions from getSession:', sessionsWithExpiry);

    const isAuthenticated = Object.keys(sessionsWithExpiry).length > 0;

    // Default behavior: pick the "primary" session if not returning all
    let responseSessions: Record<string, Session>;
    if (returnAll) {
      responseSessions = sessionsWithExpiry;
    } else {
      // pick the latest-expiring session
      const sorted = Object.entries(sessionsWithExpiry).sort(
        ([_aId, a], [_bId, b]) => (b.expiresAt ?? 0) - (a.expiresAt ?? 0)
      );
      responseSessions = sorted.length > 0 ? { [sorted[0][0]]: sorted[0][1] } : {};
    }

    return res.status(200).json({
      sessions: responseSessions,
      isAuthenticated: Object.keys(responseSessions).length > 0,
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
