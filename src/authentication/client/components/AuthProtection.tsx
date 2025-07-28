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
  const { sessions, isLoading } = useAuthContext();
  const router = useRouter();

  const isAuthenticated = (() => {
    if (isAuthenticatedFn) return isAuthenticatedFn(sessions);

    if (requireProvider) {
      return (
        sessions?.[requireProvider] !== undefined ||
        Object.values(sessions ?? {}).some(
          (session: any) => session.provider === requireProvider
        )
      );
    }

    return Object.keys(sessions ?? {}).length > 0;
  })();

  useEffect(() => {
    if (!router.isReady) return;

    if (!isLoading && !isAuthenticated) {
      console.log('[AuthProtection] Not authenticated. Redirecting to:', redirectTo);
      router.replace(redirectTo);
    } else if (!isLoading) {
      console.log('[AuthProtection] Authenticated. Access granted.');
    }
  }, [router.isReady, isLoading, isAuthenticated, redirectTo, router]);

  if (isLoading || !isAuthenticated) {
    return <>{loadingFallback?.() ?? <p>Checking authentication…</p>}</>;
  }

  return <>{children}</>;
}
