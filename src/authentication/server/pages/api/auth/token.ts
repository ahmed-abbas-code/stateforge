// src/authentication/server/pages/api/auth/token.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthProviderInstances } from '@authentication/server/utils/authRegistry';
import { getSessionCookieName } from '@authentication/shared/utils/getSessionCookieName';

/**
 * GET /api/auth/token?instanceId=providerType-instanceId
 * Returns the token from the session cookie of a specific provider instance.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const providers = getAuthProviderInstances();

  const instanceIdParam = req.query.instanceId || req.query.providerId;
  const resolvedInstanceId =
    typeof instanceIdParam === 'string'
      ? instanceIdParam
      : Array.isArray(instanceIdParam)
        ? instanceIdParam[0]
        : undefined;

  const instanceId = resolvedInstanceId ?? Object.keys(providers)[0];
  if (!instanceId) {
    console.error('[token] No auth provider instances registered');
    return res.status(500).json({ error: 'No auth providers registered' });
  }

  const provider = providers[instanceId];
  if (!provider) {
    console.warn(`[token] Unknown auth provider instance ID: ${instanceId}`);
    return res.status(400).json({ error: `Unknown provider instance: ${instanceId}` });
  }

  const cookieName = getSessionCookieName(provider.type, provider.id);
  const token = req.cookies?.[cookieName];

  if (!token) {
    console.warn(`[token] Missing cookie '${cookieName}' for instance '${provider.id}'`);
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const session = await provider.verifyToken(req, res);
    if (!session) {
      console.warn(`[token] Token verification failed for instance '${provider.id}'`);
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    return res.status(200).json({
      token,
      expiresAt: session.expiresAt ?? null,
    });
  } catch (err) {
    console.error(`[token] Error verifying token for '${provider.id}':`, err);
    return res.status(401).json({ error: 'Token verification failed' });
  }
}
