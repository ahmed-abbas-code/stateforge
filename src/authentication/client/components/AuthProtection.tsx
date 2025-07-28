// src/authentication/client/components/AuthProtection.tsx

'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '@authentication/client';

interface Props {
  children: ReactNode;
  redirectTo: string;
  loadingFallback?: () => ReactNode;

  /** Optionally require a session from a specific provider type or instance ID */
  requireProvider?: string;

  /** Or accept a custom isAuthenticated predicate */
  isAuthenticatedFn?: (sessions: Record<string, unknown>) => boolean;
}

export function AuthProtection({
  children,
  redirectTo,
  loadingFallback,
  requireProvider,
  isAuthenticatedFn,
}: Props) {
  const { sessions, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  // ✅ Compute effective auth check
  const effectiveIsAuthenticated = (() => {
    if (isAuthenticatedFn) {
      return isAuthenticatedFn(sessions);
    }

    if (requireProvider) {
      return (
        sessions?.[requireProvider] !== undefined ||
        Object.values(sessions ?? {}).some(
          (session: any) => session.provider === requireProvider
        )
      );
    }

    // Fall back to context’s built‑in logic
    return isAuthenticated;
  })();

  useEffect(() => {
    if (!router.isReady) return;

    if (!isLoading && !effectiveIsAuthenticated) {
      console.log('[AuthProtection] Not authenticated. Redirecting to:', redirectTo);
      router.replace(redirectTo);
    } else if (!isLoading) {
      console.log('[AuthProtection] Authenticated. Access granted.');
    }
  }, [router.isReady, isLoading, effectiveIsAuthenticated, redirectTo, router]);

  if (isLoading || !effectiveIsAuthenticated) {
    return <>{loadingFallback?.() ?? <p>Checking authentication…</p>}</>;
  }

  return <>{children}</>;
}
