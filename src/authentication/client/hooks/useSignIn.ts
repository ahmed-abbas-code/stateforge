// src/authentication/client/useSignIn.ts
/**
 * Hook for triggering sign-in flow via SSR backend.
 * Assumes the ID token (e.g. from Firebase) is already obtained client-side.
 */

interface SignInPayload {
  providerId: string;
  token: string;
  type?: 'idToken' | 'accessToken' | 'jwt'; // optional, in case backend needs to distinguish
}

export const useSignIn = () => {
  return async (
    payload: SignInPayload
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        return { ok: false, error: errorResponse?.error || 'Unknown error' };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  };
};
