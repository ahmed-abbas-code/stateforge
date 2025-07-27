// src/authentication/server/pages/api/auth/signin.ts

import { getAuthProviderInstances } from '@authentication/server/utils/authRegistry';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * POST /api/auth/signin
 * Accepts token(s) and delegates to a specific provider instance to set session cookies.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const providers = getAuthProviderInstances();
  const instanceId = req.body?.instanceId ?? 'default'; // fallback for single-instance apps
  const token = req.body?.idToken ?? req.body?.token;

  const provider = providers[instanceId];

  if (!provider) {
    return res.status(400).json({ error: `No auth provider found for instanceId: ${instanceId}` });
  }

  if (typeof token !== 'string' || token.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid token' });
  }

  try {
    req.body.token = token; // normalize field for provider
    await provider.signIn(req, res);

    if (!res.writableEnded) {
      res.status(200).json({ ok: true });
    }
  } catch (err) {
    console.error(`[AuthSignInError] (${instanceId})`, err);
    if (!res.writableEnded) {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }
}
