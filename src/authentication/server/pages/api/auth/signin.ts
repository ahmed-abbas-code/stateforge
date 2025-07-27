// src/authentication/server/pages/api/auth/signin.ts

import { getAuthProviderInstances } from '@authentication/server/utils/authRegistry';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * POST /api/auth/signin
 * Accepts token(s) and delegates to registered provider instance(s) to set session cookies.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const providers = getAuthProviderInstances();
  let anySucceeded = false;

  try {
    for (const [instanceId, provider] of Object.entries(providers)) {
      // Heuristic: expect token in body keyed by instance ID (e.g. "defaultToken")
      const tokenKey = `${instanceId}Token`;
      const token = req.body?.[tokenKey] ?? req.body?.idToken; // fallback for single-instance apps

      if (typeof token === 'string' && token.length > 0) {
        req.body.token = token; // Normalized token field for provider handler
        await provider.signIn(req, res);
        anySucceeded = true;
      }
    }

    if (!anySucceeded) {
      return res.status(400).json({ error: 'No valid auth tokens provided' });
    }

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
