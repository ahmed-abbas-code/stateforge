// src/authentication/server/pages/api/auth/session.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { adminAuth } from '@authentication/auth/shared';

const SESSION_COOKIE_NAME = 'session';
const EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

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
    // Verify the ID token first to ensure it's valid before creating a session
    // const decodedIdToken = await adminAuth.verifyIdToken(idToken);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: EXPIRES_IN_MS,
    });

    // Set HTTP-only session cookie
    const cookie = serialize(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: EXPIRES_IN_MS / 1000,
      path: '/',
      sameSite: 'lax',
    });

    res.setHeader('Set-Cookie', cookie);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[SESSION ERROR]', err);
    res.status(401).json({ error: 'Failed to create session cookie' });
  }
}
