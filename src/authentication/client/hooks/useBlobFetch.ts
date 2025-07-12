// src/authentication/client/hooks/useBlobFetch.ts

import { useAuthContext } from '../components/AuthProvider';

export function useBlobFetch() {
  const { handleResponse } = useAuthContext();

  return async (input: RequestInfo, init: RequestInit = {}): Promise<Blob> => {
    const res = await fetch(input, { ...init, credentials: 'include' });
    await handleResponse?.(res);        // still intercepts 401 etc.

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Request failed (${res.status})`);
    }
    return res.blob();
  };
}
