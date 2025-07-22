// src/authentication/server/utils/createBackendProxyRoute.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { getSessionCookieName } from '@authentication/server';
import { createAuthProvider } from '@authentication/server/providers/jwt';
import { createServerAxiosApp } from '@shared';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

export function createBackendProxyRoute(opts: {
  backendBaseUrl: string;
  allowedMethods?: HttpMethod[];
  instanceId?: string; // Optional, default to 'default'
}) {
  const { backendBaseUrl, allowedMethods, instanceId = 'default' } = opts;

  const jwtProvider = createAuthProvider(instanceId);
  const cookieName = getSessionCookieName('jwt', instanceId);

  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (allowedMethods && !allowedMethods.includes(req.method as HttpMethod)) {
      return res.status(405).end();
    }

    const cookies = parse(req.headers.cookie || '');
    const rawToken = cookies[cookieName];
    if (!rawToken) {
      return res.status(401).json({ error: 'Missing backend session token' });
    }

    const session = await jwtProvider.verifyToken(req, res);
    if (!session) {
      return res.status(401).json({ error: 'Invalid backend token' });
    }

    const backend = createServerAxiosApp({
      type: 'jwt',
      token: rawToken,
      userId: session.userId,
    });

    const { data, status } = await backend.request({
      url: '/' + (req.query.slug as string[]).join('/'),
      method: req.method,
      data: ['GET', 'HEAD'].includes(req.method!) ? undefined : req.body,
      baseURL: backendBaseUrl,
    });

    res.status(status).send(data);
  };
}
