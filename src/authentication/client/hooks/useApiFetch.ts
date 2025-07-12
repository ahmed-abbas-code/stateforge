import { useAuthContext } from '@authentication/client';

type ExtendedRequestInit = RequestInit & {
  raw?: boolean; // ✅ allows returning the raw Response
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

  return async <T = unknown>(
    input: RequestInfo,
    init?: ExtendedRequestInit
  ): Promise<T | Response> => {
    const res = await fetch(input, {
      ...init,
      credentials: 'include',
    });

    await handleResponse(res);

    if (init?.raw) return res; // ✅ bypass parsing, return raw Response

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
