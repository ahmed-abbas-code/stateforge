import { useAuthContext } from '@authentication/client';

type ExtendedRequestInit = RequestInit & {
  raw?: boolean; // ✅ optional flag to return raw Response
};

/**
 * A shared fetch wrapper that:
 * - includes credentials (cookies)
 * - runs global 401 interception via handleResponse
 * - parses JSON automatically (or returns undefined for 204)
 * - optionally returns raw Response when `raw: true` is set
 */
export function useApiFetch() {
  const auth = useAuthContext();

  if (!auth?.handleResponse) {
    throw new Error(
      'useApiFetch must be used within an AuthProvider that defines handleResponse'
    );
  }

  const { handleResponse } = auth;

  return async function fetchWithHandling<T = unknown>(
    input: RequestInfo,
    init?: ExtendedRequestInit
  ): Promise<T | Response> {
    const res = await fetch(input, {
      ...init,
      credentials: 'include',
    });

    await handleResponse(res);

    // ✅ 1. allow returning raw response directly
    if (init?.raw) return res;

    // ✅ 2. handle no-content responses
    if (res.status === 204 || res.status === 205) {
      return undefined as T;
    }

    // ✅ 3. parse JSON or fallback to plain text
    try {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await res.json();
      }
      const text = await res.text();
      return text as unknown as T;
    } catch {
      return undefined as T;
    }
  };
}
