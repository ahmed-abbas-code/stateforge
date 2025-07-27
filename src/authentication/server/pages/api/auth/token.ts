// src/authentication/server/pages/api/auth/token.ts

import type { NextApiRequest, NextApiResponse } from 'next';

import { getAuthProviderInstances } from '@authentication/server/utils/authRegistry';
import { getSessionCookieName } from '@authentication/shared/utils/getSessionCookieName';

/**
 * GET /api/auth/token?providerId=some-instance-id
 * Returns the token from the session cookie of a specific provider instance.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const providers = getAuthProviderInstances();
  const providerIdParam = req.query.providerId;

  const resolvedInstanceId =
    typeof providerIdParam === 'string'
      ? providerIdParam
      : Array.isArray(providerIdParam)
        ? providerIdParam[0]
        : undefined;

  const instanceId =
    resolvedInstanceId ?? Object.keys(providers)[0];

  if (!instanceId) {
    console.error('[token] No auth provider instances registered');
    return res.status(500).json({ error: 'No auth providers registered' });
  }

  const selectedProvider = providers[instanceId];

  if (!selectedProvider) {
    console.warn(`[token] Unknown provider instance ID: ${instanceId}`);
    return res.status(400).json({ error: `Unknown provider instance: ${instanceId}` });
  }

  const cookieName = getSessionCookieName(selectedProvider.type, instanceId);
  const token = req.cookies?.[cookieName];

  if (!token) {
    console.warn(`[token] Missing cookie '${cookieName}' for provider '${instanceId}'`);
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const session = await selectedProvider.verifyToken(req, res);
    if (!session) {
      console.warn(`[token] Token verification failed for provider '${instanceId}'`);
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    return res.status(200).json({ token });
  } catch (err) {
    console.error(`[token] Error verifying token for '${instanceId}':`, err);
    return res.status(401).json({ error: 'Token verification failed' });
  }
}
