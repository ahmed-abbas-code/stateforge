// pages/api/auth/signout.ts

import { AuthStrategy } from '@authentication/auth/server/auth-strategy';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * POST /api/auth/signout
 *
 * For Firebase/JWT: clears session cookie.
 * For Auth0: performs redirect via Auth0 SDK.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    await AuthStrategy.signOut(req, res);
    // Avoid double response write in case of Auth0 redirect
    if (!res.writableEnded) {
      res.status(200).json({ ok: true });
    }
  } catch (err) {
    console.error('[AuthSignOutError]', err);
    if (!res.writableEnded) {
      res.status(500).json({ error: 'Sign-out failed' });
    }
  }
}

