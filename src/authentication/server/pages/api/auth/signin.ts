// src/authentication/server/pages/api/auth/signin.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthStrategyProvider } from '@authentication/server';
 
/**
 * POST /api/auth/signin
 * 
 * For Firebase/JWT: accepts { idToken } and sets secure session cookie.
 * For Auth0: triggers redirect via Auth0 SDK (no response body).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    await AuthStrategyProvider.signIn(req, res);
    // If the strategy completes the response (e.g., Auth0 redirect), do not respond again
    if (!res.writableEnded) {
      res.status(200).json({ ok: true });
    }
  } catch (err) {
    console.error('[AuthSignInError]', err);
    if (!res.writableEnded) {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }
}

