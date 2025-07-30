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
}

/**
 * Centralized builder for /api/auth/context, /api/auth/me, etc.
 */
export async function buildAuthContextResponse(
  req: NextApiRequest,
  res: NextApiResponse,
  opts: BuildAuthContextOptions = {}
): Promise<AuthContextResponse> {
  const { returnAll = false, primaryInstanceId = JWT_INSTANCE_ID } = opts;

  const { sessions, isAuthenticated, user, users } = await hydrateSessions(
    req,
    res,
    [FIREBASE_INSTANCE_ID, JWT_INSTANCE_ID],
    primaryInstanceId
  );

  return {
    sessions: returnAll ? users ?? {} : (user ? { [user.providerId]: user } : {}),
    isAuthenticated,
    user,
    users: returnAll ? users : undefined,
    error: null,
  };
}
