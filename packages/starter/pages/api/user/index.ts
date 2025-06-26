import type { NextApiRequest, NextApiResponse } from 'next';

import { createServerPersistenceStrategy } from '@stateforge/core/server';
import { STRATEGY_TYPES } from '@stateforge/core/types/PersistenceOptions';
import { appStateSchema } from '@stateforge/core/types/validation/appStateSchema';
import { validateSchema } from '@stateforge/core';

const strategy = createServerPersistenceStrategy({
  type: STRATEGY_TYPES.REST_API,
  namespace: 'user',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = 'demo-user'; // TODO: securely extract from auth token
  const key = `${userId}:profile`;

  switch (req.method) {
    case 'GET': {
      const data = await strategy.get(key);
      const validated = validateSchema(appStateSchema, data, 'AppState GET');

      res.status(200).json(
        validated.success
          ? validated.data
          : { name: 'Anonymous', theme: 'light' } // fallback
      );
      break;
    }

    case 'POST': {
      const result = validateSchema(appStateSchema, req.body, 'AppState POST');

      if (!result.success) {
        return res.status(400).json({ error: result.error.flatten() });
      }

      await strategy.set(key, result.data);
      res.status(200).json({ status: 'updated' });
      break;
    }

    default: {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
}
