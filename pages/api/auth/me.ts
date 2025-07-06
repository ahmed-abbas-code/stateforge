// pages/api/auth/me.ts

import { AuthStrategy } from '@authentication/auth/server/auth-strategy';
import { AuthUser } from '@authentication/auth/shared';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * GET /api/auth/me
 *
 * Returns the authenticated user from the current session.
 * Supports Firebase, Auth0, JWT, etc., via strategy pattern.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ user: AuthUser | null; error?: string }>
): Promise<void> {
  try {
    const user = await AuthStrategy.verifyToken(req);

    res.status(200).json({ user });
  } catch (err: unknown) {
    console.warn('[API] /auth/me unauthorized access:', err);
    res.status(401).json({ user: null, error: 'Invalid or expired session' });
  }
}

