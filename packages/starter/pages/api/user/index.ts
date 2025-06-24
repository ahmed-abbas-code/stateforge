// /packages/starter/pages/api/user/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createPersistenceStrategy } from '@stateforge/core';

const strategy = createPersistenceStrategy({
  type: 'rest', // or 'firestore' or 'redis'
  namespace: 'user',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = 'demo-user'; // Replace with real user ID from token
  const key = `${userId}:profile`;

  switch (req.method) {
    case 'GET': {
      const data = await strategy.get(key);
      res.status(200).json(data ?? { name: 'Anonymous', theme: 'light' });
      break;
    }

    case 'POST': {
      const body = req.body;
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Invalid payload' });
      }
      await strategy.set(key, body);
      res.status(200).json({ status: 'updated' });
      break;
    }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
