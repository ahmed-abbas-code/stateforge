// src/authentication/server/pages/api/auth/token.ts

import type { NextApiRequest, NextApiResponse } from 'next';

import { getAuthProviderInstances } from '@authentication/server/utils/authRegistry';
import { getSessionCookieName } from '@authentication/shared/utils/getSessionCookieName';

/**
 * GET /api/auth/token?providerId=some-provider
 * Returns a token (e.g. JWT or Firebase ID token) from the session cookie
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const providers = getAuthProviderInstances();
  const providerIdParam = req.query.providerId;

  const providerId =
    typeof providerIdParam === 'string'
      ? providerIdParam
      : Array.isArray(providerIdParam)
        ? providerIdParam[0]
        : undefined;

  let selectedProvider;

  if (providerId) {
    selectedProvider = providers[providerId];
    if (!selectedProvider) {
      console.warn(`[token] Unknown providerId: ${providerId}`);
      return res.status(400).json({ error: `Unknown providerId: ${providerId}` });
    }
  } else {
    selectedProvider = Object.values(providers)[0];
    if (!selectedProvider) {
      console.error('[token] No auth providers registered');
      return res.status(500).json({ error: 'No auth providers registered' });
    }
  }

  const cookieName = getSessionCookieName(selectedProvider.type, selectedProvider.id);
  const token = req.cookies?.[cookieName];

  if (!token) {
    console.warn(`[token] Missing cookie '${cookieName}' for provider '${selectedProvider.id}'`);
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const session = await selectedProvider.verifyToken(req, res);
    if (!session) {
      console.warn(`[token] Token verification failed for provider '${selectedProvider.id}'`);
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    return res.status(200).json({ token });
  } catch (err) {
    console.error(`[token] Error verifying token for '${selectedProvider.id}':`, err);
    return res.status(401).json({ error: 'Token verification failed' });
  }
}
