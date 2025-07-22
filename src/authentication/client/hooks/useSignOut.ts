// src/authentication/client/useSignOut.ts

/**
 * Hook for triggering sign-out flow via SSR backend.
 * Server is expected to clear HTTP-only cookie(s) for the given provider(s).
 */

export interface SignOutPayload {
  /**
   * One or more provider instance IDs to sign out from.
   * If omitted, the backend may sign out of all active providers.
   */
  providerIds?: string[];
}

export const useSignOut = () => {
  return async (
    payload?: SignOutPayload
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include', // Ensure cookies are sent
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload ?? {}),
      });

      if (!res.ok) {
        const errorResponse = await res.json().catch(() => ({}));
        return { ok: false, error: errorResponse?.error || 'Unknown error' };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  };
};
