// /packages/starter/pages/api/user/secure.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyFirebaseToken } from '@stateforge/core';
import { getSession } from '@auth0/nextjs-auth0'; // Optional: only if using Auth0

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Detect auth strategy
    const strategy = process.env.NEXT_PUBLIC_AUTH_STRATEGY;

    let userId: string | null = null;

    if (strategy === 'firebase') {
      const token = req.headers.authorization?.split(' ')[1];
      const decoded = await verifyFirebaseToken(token);
      userId = decoded?.uid || null;
    } else if (strategy === 'auth0') {
      const session = await getSession(req, res);
      userId = session?.user?.sub || null;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.status(200).json({
      secureData: `This is protected for user: ${userId}`,
    });
  } catch (err) {
    res.status(401).json({ error: 'Token invalid or missing' });
  }
}
