// src/authentication/client/hooks/useApiFetch.ts

import { useAuthContext } from '@authentication/client';

type ResponseType = 'json' | 'blob' | 'text';

interface ExtendedRequestInit extends RequestInit {
  raw?: boolean;
  responseType?: ResponseType;
  providerId?: string;
}

/**
 * Unified fetch hook that:
 * - Uses credentials
 * - Handles 401/interceptors via AuthContext
 * - Optionally attaches token from a specific provider
 * - Supports responseType: 'json', 'blob', or 'text'
 * - Optionally returns raw Response with raw: true
 */
export function useApiFetch() {
  const auth = useAuthContext();

  if (!auth?.handleResponse || !auth?.getToken) {
    throw new Error('useApiFetch must be used within an AuthProvider that defines handleResponse and getToken');
  }

  const { handleResponse, getToken } = auth;

  return async function fetchWithHandling<T = unknown>(
    input: RequestInfo,
    init: ExtendedRequestInit = {}
  ): Promise<T | Response> {
    const {
      raw,
      responseType = 'json',
      providerId = 'dunnixer',
      headers = {},
      ...fetchInit
    } = init;

    const token = await getToken(providerId);

    // Build merged headers safely
    const mergedHeaders: HeadersInit = {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(input, {
      ...fetchInit,
      headers: mergedHeaders,
      credentials: 'include',
    });

    await handleResponse(res);

    if (raw) return res;

    if (res.status === 204 || res.status === 205) {
      return undefined as T;
    }

    if (responseType === 'blob') {
      return await res.blob() as T;
    }

    if (responseType === 'text') {
      return await res.text() as T;
    }

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
