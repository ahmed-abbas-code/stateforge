// src/authentication/server/pages/api/auth/session.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { adminAuth } from '@authentication/server';
import { getAuthProviderInstances } from '@authentication/server/utils/authRegistry';
import { getSessionCookieName } from '@authentication/shared/utils/getSessionCookieName';
import { getCookieOptions } from '@authentication/shared/constants/sessionCookieOptions';
import type { AuthContext } from '@authentication/shared/types/AuthProvider';

const EXPIRES_IN_SECONDS = 60 * 60 * 24 * 5; // 5 days
const EXPIRES_IN_MS = EXPIRES_IN_SECONDS * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const { idToken } = req.body;

  if (!idToken || typeof idToken !== 'string') {
    return res.status(400).json({ error: 'ID token is required' });
  }

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: EXPIRES_IN_MS,
    });

    // 🔁 Updated to match convention
    const instanceId = 'default'; // or from req.query/headers if needed
    const providerType = process.env.AUTH_STRATEGY || 'firebase';

    const provider = getAuthProviderInstances()[instanceId];
    if (!provider) {
      return res.status(500).json({ error: 'Auth provider not found' });
    }

    const cookieName = getSessionCookieName(providerType, instanceId);

    const context: AuthContext = { req, res, existingSessions: {} };
    const rawOptions =
      typeof provider.cookieOptions === 'function'
        ? provider.cookieOptions(context)
        : provider.cookieOptions ?? {};

    const options = getCookieOptions({
      ...rawOptions,
      maxAge: EXPIRES_IN_SECONDS, // override to match session cookie age
    });

    res.setHeader('Set-Cookie', serialize(cookieName, sessionCookie, options));
    res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[SESSION ERROR]', err);
    res.status(401).json({ error: 'Failed to create session cookie' });
  }
}
