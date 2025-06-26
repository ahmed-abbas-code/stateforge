// packages/starter/pages/api/auth/firebase.ts

import { verifyFirebaseToken } from '@stateforge/core/server-only';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyFirebaseToken(token);

    res.status(200).json({ uid: decoded.uid, email: decoded.email });
  } catch (err) {
    console.error('[auth/firebase]', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
