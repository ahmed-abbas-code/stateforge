// src/authentication/client/useSignOut.ts

/**
 * Hook for triggering sign-out flow via SSR backend.
 * Server is expected to clear the HTTP-only cookie.
 */

export const useSignOut = () => {
  return async (): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include', // Ensure cookie is sent with request
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
