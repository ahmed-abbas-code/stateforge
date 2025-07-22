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

  // Normalize providerId from query
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
      return res.status(400).json({ error: `Unknown providerId: ${providerId}` });
    }
  } else {
    // Fallback to first available provider (or define a preferred default)
    selectedProvider = Object.values(providers)[0];
    if (!selectedProvider) {
      return res.status(500).json({ error: 'No auth providers registered' });
    }
  }

  const cookieName = getSessionCookieName(selectedProvider.type, selectedProvider.id);
  const token = req.cookies[cookieName];

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const session = await selectedProvider.verifyToken(req, res);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  // Return token from session (could be raw cookie, or enriched value)
  return res.status(200).json({ token });
}
