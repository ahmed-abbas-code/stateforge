// src/authentication/server/utils/createBackendProxyRoute.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { jwtSessionCookieName, verifyJwtToken } from '@authentication/server';
import { createServerAxiosApp } from '@shared';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

export function createBackendProxyRoute(opts: {
  backendBaseUrl: string;
  allowedMethods?: HttpMethod[];
}) {
  const { backendBaseUrl, allowedMethods } = opts;

  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (allowedMethods && !allowedMethods.includes(req.method as HttpMethod)) {
      return res.status(405).end();
    }

    const user = await verifyJwtToken(req);

    const cookies = parse(req.headers.cookie || '');
    const rawToken = cookies[jwtSessionCookieName];
    if (!rawToken) {
      return res.status(401).json({ error: 'Missing backend session token' });
    }

    const backend = createServerAxiosApp({
      type: 'jwt',
      token: rawToken,
      userId: user.uid,
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
