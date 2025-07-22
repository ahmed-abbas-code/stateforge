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
    return res.status(500).json({ error: 'JWT provider not configured' });
  }

  const user = await provider.verifyToken(req, res);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or missing JWT session' });
  }

  const cookies = parse(req.headers.cookie || '');
  const rawToken = cookies[getSessionCookieName('jwt', JWT_INSTANCE_ID)];
  if (!rawToken) {
    return res.status(401).json({ error: 'Missing backend session token' });
  }

  const backend = createServerAxiosApp({
    type: 'jwt',
    token: rawToken,
    userId: user.userId,
  });

  try {
    const { data, status } = await backend.request({
      url: '/' + (req.query.slug as string[]).join('/'),
      method: req.method,
      data: ['GET', 'HEAD'].includes(req.method!) ? undefined : req.body,
      baseURL: BASE,
    });

    res.status(status).send(data);
  } catch (err) {
    console.error('[BFF ERROR]', err);
    res.status(502).json({ error: 'Failed to contact backend' });
  }
}
