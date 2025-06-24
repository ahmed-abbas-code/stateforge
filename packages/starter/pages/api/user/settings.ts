// /packages/starter/pages/api/user/settings.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { appStateSchema } from '@stateforge/core/types/validation/appStateSchema';
import { createPersistenceStrategy } from '@stateforge/core/strategies/factory/createPersistenceStrategy';
import { z } from 'zod';

// Inferred type from schema
type AppState = z.infer<typeof appStateSchema>;

const strategy = createPersistenceStrategy<AppState>({
  type: 'redis-server', // or 'firestore-server'
  namespace: 'user-settings',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const result = appStateSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() });
  }

  const validatedSettings = result.data;
  const userId = req.headers['x-user-id']?.toString() || 'anonymous';

  try {
    await strategy.set(userId, validatedSettings);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Failed to save settings:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
