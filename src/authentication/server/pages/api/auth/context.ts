// src/pages/api/auth/context.ts

import type { NextApiRequest, NextApiResponse } from 'next';

// 👇 Register auth providers
import '@/lib/auth/init';
import { getSession } from '@authentication/server/utils/sessionUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sessions = await getSession(req, res);
    return res.status(200).json({ sessions });
  } catch (error: any) {
    console.error('[Context API] Failed to load sessions:', error);
    return res.status(500).json({ error: 'Failed to load session context' });
  }
}
