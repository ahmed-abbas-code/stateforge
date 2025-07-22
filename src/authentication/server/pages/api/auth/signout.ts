// src/authentication/server/pages/api/auth/signout.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthProviderInstances } from '@authentication/server/utils/authRegistry';

/**
 * POST /api/auth/signout
 * Clears session cookies for all registered or specified auth providers.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const providers = getAuthProviderInstances();

  let providerIds: string[] | undefined;

  try {
    if (req.body && typeof req.body === 'object') {
      providerIds = req.body.providerIds;
    }

    const selectedProviders = providerIds?.length
      ? Object.values(providers).filter(p => providerIds!.includes(p.id))
      : Object.values(providers);

    for (const provider of selectedProviders) {
      await provider.signOut(req, res);
    }

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
