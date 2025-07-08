// src/authentication/server/pages/api/auth/me.ts

import { AuthStrategyProvider } from '@authentication/server';
import { AuthUserType } from '@authentication/shared';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * GET /api/auth/me
 * Returns the authenticated user from the current session.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ user: AuthUserType | null; error?: string }>
): Promise<void> {
  try {
    const user = await AuthStrategyProvider.verifyToken(req);
    res.status(200).json({ user });
  } catch (err: unknown) {
    // Only warn on unexpected failures (not the normal "no cookie" case)
    if (!(err instanceof Error && err.message === 'No session cookie found')) {
      console.warn('[API] /auth/me unexpected error:', err);
    }
    res.status(401).json({ user: null, error: 'Invalid or expired session' });
  }
}
