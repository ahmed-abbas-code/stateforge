// src/authentication/server/pages/api/auth/signin.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthProviderInstances } from '@authentication/server/utils/authRegistry';

/**
 * POST /api/auth/signin
 * Delegates to the correct auth provider instance to set session cookies based on the incoming token.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const instanceId: string = req.body?.instanceId ?? 'default'; // fallback
  const token: string | undefined = req.body?.idToken ?? req.body?.token;

  const providers = getAuthProviderInstances();
  const provider = providers[instanceId];

  if (!provider) {
    return res.status(400).json({ error: `Auth provider not found for instanceId: ${instanceId}` });
  }

  if (typeof token !== 'string' || !token.trim()) {
    return res.status(400).json({ error: 'Missing or invalid token' });
  }

  try {
    req.body.token = token;

    // 🔍 Log for timestamp debugging
    const now = new Date();
    console.log(`[signin] Server time: ${now.toISOString()} (${Date.now()})`);

    await provider.signIn(req, res);

    if (!res.writableEnded) {
      res.status(200).json({ ok: true });
    }
  } catch (err) {
    console.error(`[AuthSignInError] [${instanceId}]`, err);
    if (!res.writableEnded) {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }
}
