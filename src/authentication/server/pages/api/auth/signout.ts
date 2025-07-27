// src/authentication/server/pages/api/auth/signout.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthProviderInstances } from '@authentication/server/utils/authRegistry';

/**
 * POST /api/auth/signout
 * Clears session cookies for all registered or specified provider **instances**.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const providers = getAuthProviderInstances();
  let instanceIds: string[] | undefined;

  try {
    if (req.body && typeof req.body === 'object') {
      instanceIds = req.body.providerIds;
    }

    const selectedEntries = instanceIds?.length
      ? Object.entries(providers).filter(([instanceId]) => instanceIds!.includes(instanceId))
      : Object.entries(providers);

    for (const [instanceId, provider] of selectedEntries) {
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
