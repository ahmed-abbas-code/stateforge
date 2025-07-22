// src/authentication/client/hooks/useApiFetch.ts

import { useAuthContext } from '@authentication/client';

type ResponseType = 'json' | 'blob' | 'text';

interface ExtendedRequestInit extends RequestInit {
  raw?: boolean;
  responseType?: ResponseType;
}

/**
 * Unified fetch hook that:
 * - Uses credentials
 * - Handles 401/interceptors via AuthContext
 * - Supports `responseType`: 'json' (default), 'blob', or 'text'
 * - Optionally returns raw Response with `raw: true`
 */
export function useApiFetch() {
  const auth = useAuthContext();

  if (!auth?.handleResponse) {
    throw new Error('useApiFetch must be used within an AuthProvider that defines handleResponse');
  }

  const { handleResponse } = auth;

  return async function fetchWithHandling<T = unknown>(
    input: RequestInfo,
    init: ExtendedRequestInit = {}
  ): Promise<T | Response> {
    const { raw, responseType = 'json', ...fetchInit } = init;

    const res = await fetch(input, {
      ...fetchInit,
      credentials: 'include',
    });

    await handleResponse(res);

    if (raw) return res;

    // 204/205: No content
    if (res.status === 204 || res.status === 205) {
      return undefined as T;
    }

    // Blob response
    if (responseType === 'blob') {
      return await res.blob() as T;
    }

    // Text response
    if (responseType === 'text') {
      return await res.text() as T;
    }

    // Default: JSON
    try {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await res.json();
      }
      return await res.text() as unknown as T;
    } catch {
      return undefined as T;
    }
  };
}
