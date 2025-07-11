// src/authentication/client/hooks/useApiFetch.ts

import { useAuthContext } from '@authentication/client';

/**
 * A shared fetch wrapper that:
 * - includes credentials (cookies)
 * - runs global 401 interception via handleResponse
 * - parses JSON automatically (or returns undefined for 204)
 */
export function useApiFetch() {
  const auth = useAuthContext();

  if (!auth?.handleResponse) {
    throw new Error(
      'useApiFetch must be used within an AuthProvider that defines handleResponse'
    );
  }

  const { handleResponse } = auth;

  return async <T = unknown>(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<T> => {
    const res = await fetch(input, {
      ...init,
      credentials: 'include',
    });

    await handleResponse(res);

    // Handle no-content responses
    if (res.status === 204 || res.status === 205) {
      return undefined as T;
    }

    try {
      return await res.json();
    } catch {
      const text = await res.text();
      return text as unknown as T;
    }
  };
}
