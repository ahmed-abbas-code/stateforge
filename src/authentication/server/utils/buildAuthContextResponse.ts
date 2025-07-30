// src/authentication/server/utils/buildAuthContextResponse.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from '@authentication/shared/types/AuthProvider';
import { hydrateSessions } from '@authentication/server';
import type { AuthContextMeta } from '@authentication/shared/types/AuthClientContext';

const FIREBASE_INSTANCE_ID = 'firebase-default';
const JWT_INSTANCE_ID      = 'jwt-default';

export interface AuthContextResponse extends AuthContextMeta {
  sessions: Record<string, Session>;
  isAuthenticated: boolean;
  user: Session | null;
  users?: Record<string, Session>;
  error: string | null;
  ok?: boolean;       // ✅ always provided for client logic
  expiresAt?: number; // ✅ unified expiry timestamp
}

export interface BuildAuthContextOptions {
  returnAll?: boolean;
  primaryInstanceId?: string;
  /**
   * Optional decoded Firebase token for fallback hydration
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
    returnAll        = false,
    primaryInstanceId = JWT_INSTANCE_ID,
    fallbackDecoded,
  } = opts;

  // ────────────────────────────────────────────────────────────
  // 1️⃣  Load sessions via helper
  // ────────────────────────────────────────────────────────────
  let { sessions, isAuthenticated, user, users } = await hydrateSessions(
    req,
    res,
    [FIREBASE_INSTANCE_ID, JWT_INSTANCE_ID],
    primaryInstanceId
  );

  // ────────────────────────────────────────────────────────────
  // 2️⃣  Cookie present but no sessions?  Build from fallback.
  // ────────────────────────────────────────────────────────────
  if (!isAuthenticated && Object.keys(sessions ?? {}).length === 0) {
    const cookieKeys = Object.keys(req.cookies ?? {});
    if (cookieKeys.some((k) => k.startsWith('sf.')) && fallbackDecoded) {
      console.warn(
        '[AuthContext] hydrateSessions returned empty; using fallbackDecoded to build session.'
      );

      const now   = Date.now();
      const expMs = fallbackDecoded.exp ? fallbackDecoded.exp * 1000 : now + 3_600_000;

      const fallbackSession: Session = {
        providerId: fallbackDecoded.providerId ?? primaryInstanceId,
        userId    : fallbackDecoded.uid,
        email     : fallbackDecoded.email ?? undefined,
        issuedAt  : fallbackDecoded.iat ? fallbackDecoded.iat * 1000 : now,
        expiresAt : expMs,
      };

      sessions = {
        [FIREBASE_INSTANCE_ID]: { ...fallbackSession, providerId: FIREBASE_INSTANCE_ID },
        [JWT_INSTANCE_ID]     : { ...fallbackSession, providerId: JWT_INSTANCE_ID },
      };

      users          = { ...sessions };
      user           = sessions[primaryInstanceId];
      isAuthenticated = true;
    }
  }

  // ────────────────────────────────────────────────────────────
  // 3️⃣  Ensure `users` is never undefined when we need “all”.
  // ────────────────────────────────────────────────────────────
  const allUsers = users ?? sessions;         // <- key line

  const expiresAt = user?.expiresAt;

  // ────────────────────────────────────────────────────────────
  // 4️⃣  Unified response
  // ────────────────────────────────────────────────────────────
  return {
    sessions       : returnAll ? allUsers : user ? { [user.providerId]: user } : {},
    isAuthenticated,
    user,
    users          : returnAll ? allUsers : undefined,
    error          : null,
    ok             : isAuthenticated,
    expiresAt,
  };
}
