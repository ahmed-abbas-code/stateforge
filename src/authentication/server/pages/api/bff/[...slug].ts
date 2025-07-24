// src/authentication/server/pages/api/bff/[...slug].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { createServerAxiosApp } from '@shared';
import { getAuthProviderInstances } from '@authentication/server/utils/authRegistry';
import { getSessionCookieName } from '@authentication/shared/utils/getSessionCookieName';

const BASE = process.env.BACKEND_APP_API_BASE_URL!;
const JWT_INSTANCE_ID = 'dunnixer'; // Change or make configurable per route

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const providers = getAuthProviderInstances();
  const provider = providers[JWT_INSTANCE_ID];

  if (!provider || provider.type !== 'jwt') {
    console.error(`[BFF] Provider '${JWT_INSTANCE_ID}' not found or not a JWT provider.`);
    return res.status(500).json({ error: 'JWT provider not configured' });
  }

  let user = null;
  try {
    user = await provider.verifyToken(req, res);
    if (!user) {
      console.warn('[BFF] Failed to verify JWT session.');
      return res.status(401).json({ error: 'Invalid or missing JWT session' });
    }
  } catch (err) {
    console.error('[BFF] Error verifying JWT token:', err);
    return res.status(401).json({ error: 'Token verification failed' });
  }

  const cookies = parse(req.headers.cookie || '');
  const token = cookies[getSessionCookieName('jwt', JWT_INSTANCE_ID)];

  if (!token) {
    console.warn('[BFF] Missing JWT session token cookie.');
    return res.status(401).json({ error: 'Missing backend session token' });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[BFF] User:', user);
    console.log('[BFF] JWT token:', token.substring(0, 12) + '...'); // Partial token for debug
  }

  const backend = createServerAxiosApp({
    type: 'jwt',
    token,
    userId: user.userId,
  });

  try {
    const { data, status } = await backend.request({
      url: '/' + (req.query.slug as string[]).join('/'),
      method: req.method,
      data: ['GET', 'HEAD'].includes(req.method!) ? undefined : req.body,
      baseURL: BASE,
    });

    return res.status(status).send(data);
  } catch (err) {
    console.error('[BFF] Failed to contact backend:', err);
    return res.status(502).json({ error: 'Failed to contact backend' });
  }
}
