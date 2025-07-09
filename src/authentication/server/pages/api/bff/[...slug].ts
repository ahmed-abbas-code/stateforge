// src/authentication/server/pages/api/bff/[...slug].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { verifyJwtToken, jwtSessionCookieName } from '@authentication/server';
import { createServerAxiosApp } from '@shared';

const BASE = process.env.BACKEND_APP_API_BASE_URL!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    baseURL: BASE,
  });

  res.status(status).send(data);
}
