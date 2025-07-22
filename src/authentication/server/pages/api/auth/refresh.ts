// src/authentication/server/pages/api/auth/refresh.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { refreshSessions } from '@authentication/server/utils/sessionUtils';
import {
  mapDecodedToAuthUserFromSessions
} from '@authentication/server/utils/mapDecodedToAuthUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const newSessions = await refreshSessions(req, res);

    if (Object.keys(newSessions).length === 0) {
      return res.status(401).json({ user: null, error: 'No sessions refreshed' });
    }

    const user = mapDecodedToAuthUserFromSessions(newSessions);
    return res.status(200).json({ user });
  } catch (err) {
    console.error('Error during session refresh:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
