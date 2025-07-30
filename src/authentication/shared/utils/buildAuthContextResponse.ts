// src/authentication/shared/utils/buildAuthContextResponse.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from '@authentication/shared/types/AuthProvider';
import { hydrateSessions } from '@authentication/shared';

const FIREBASE_INSTANCE_ID = 'firebase-default';
const JWT_INSTANCE_ID = 'jwt-default';

export type AuthContextResponse = {
  sessions: Record<string, Session>;
  isAuthenticated: boolean;
  user: Session | null;
  users?: Record<string, Session>;
  error: string | null;
};

export interface BuildAuthContextOptions {
  returnAll?: boolean;
  primaryInstanceId?: string;
  /**
   * Decoded Firebase token for fallback hydration
   */
  fallbackDecoded?: {
    uid: string;
    email?: string | null;
    exp?: number;
    iat?: number;
    providerId?: string;
  };
}

/**
 * Centralized builder for /api/auth/context, /api/auth/me, etc.
 */
export async function buildAuthContextResponse(
  req: NextApiRequest,
  res: NextApiResponse,
  opts: BuildAuthContextOptions = {}
): Promise<AuthContextResponse> {
  const {
    returnAll = false,
    primaryInstanceId = JWT_INSTANCE_ID,
    fallbackDecoded,
  } = opts;

  let { sessions, isAuthenticated, user, users } = await hydrateSessions(
    req,
    res,
    [FIREBASE_INSTANCE_ID, JWT_INSTANCE_ID],
    primaryInstanceId
  );

  // 🔹 If hydrateSessions failed but cookies exist and we have fallbackDecoded
  if (!isAuthenticated && (!sessions || Object.keys(sessions).length === 0)) {
    const cookieKeys = Object.keys(req.cookies ?? {});
    if (cookieKeys.some((k) => k.startsWith('sf.')) && fallbackDecoded) {
      console.warn(
        '[AuthContext] hydrateSessions returned empty; using fallbackDecoded to build session.'
      );

      const now = Date.now();
      const expMs = fallbackDecoded.exp ? fallbackDecoded.exp * 1000 : now + 3600_000;

      const fallbackSession: Session = {
        providerId: fallbackDecoded.providerId ?? primaryInstanceId,
        userId: fallbackDecoded.uid,
        email: fallbackDecoded.email ?? undefined, // ✅ fix: ensure string | undefined
        issuedAt: fallbackDecoded.iat ? fallbackDecoded.iat * 1000 : now,
        expiresAt: expMs,
      };

      sessions = {
        [FIREBASE_INSTANCE_ID]: { ...fallbackSession, providerId: FIREBASE_INSTANCE_ID },
        [JWT_INSTANCE_ID]: { ...fallbackSession, providerId: JWT_INSTANCE_ID },
      };

      users = { ...sessions };
      user = sessions[primaryInstanceId];
      isAuthenticated = true;
    }
  }

  return {
    sessions: returnAll ? users ?? {} : user ? { [user.providerId]: user } : {},
    isAuthenticated,
    user,
    users: returnAll ? users : undefined,
    error: null,
  };
}
