// src/authentication/server/utils/hydrateSessions.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from '@authentication/shared';
import { getAllSessions } from '@authentication/server';
import { jwtDecode } from 'jwt-decode';

type TokenPayload = { exp?: number };

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
        console.warn(`[hydrateSessions] Failed to decode token for ${key}:`, err);
      }
    }
    enhanced[key] = session;
  }
  return enhanced;
}

export async function hydrateSessions(
  req: NextApiRequest,
  res: NextApiResponse,
  instanceIds: string[] = [],
  primaryInstanceId?: string
) {
  const sessions = await getAllSessions(req, res);

  // normalize with expiry
  const sessionsWithExpiry = ensureExpiresAt(sessions);

  // Only include sessions the caller requested
  const filteredSessions: Record<string, Session> = {};
  for (const id of instanceIds) {
    if (sessionsWithExpiry[id]) {
      filteredSessions[id] = sessionsWithExpiry[id];
    }
  }

  const isAuthenticated = Object.keys(filteredSessions).length > 0;

  const user =
    isAuthenticated && primaryInstanceId && filteredSessions[primaryInstanceId]
      ? filteredSessions[primaryInstanceId]
      : null;

  const users = isAuthenticated ? filteredSessions : {};

  return {
    sessions: filteredSessions,
    isAuthenticated,
    user,
    users,
  };
}
