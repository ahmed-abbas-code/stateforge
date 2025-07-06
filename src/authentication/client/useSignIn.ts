// src/authentication/client/useSignIn.ts
/**
 * Hook for triggering sign-in flow via SSR backend.
 * Assumes the ID token (e.g. from Firebase) is already obtained client-side.
 */

export const useSignIn = () => {
  return async (idToken: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensures cookie is set on the same domain
        body: JSON.stringify({ idToken }),
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
