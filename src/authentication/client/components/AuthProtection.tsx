// src/authentication/client/components/AuthProtection.tsx

'use client';

import { useEffect, ReactNode, useState } from 'react';
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

  // ✅ Track client‑side rendering to avoid SSR mismatch
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  // ✅ Compute effective auth check
  const effectiveIsAuthenticated: boolean | undefined = (() => {
    if (isLoading) return undefined; // defer until loading completes

    if (isAuthenticatedFn) {
      return isAuthenticatedFn(sessions);
    }

    if (requireProvider) {
      return (
        !!sessions?.[requireProvider] ||
        Object.values(sessions ?? {}).some(
          (session: any) => session.provider === requireProvider
        )
      );
    }

    return isAuthenticated;
  })();

  // ✅ Handle redirect when decision is clear
  useEffect(() => {
    if (!isClient || !router.isReady || effectiveIsAuthenticated === undefined) return;

    if (!effectiveIsAuthenticated) {
      console.warn('[AuthProtection] ❌ Not authenticated. Redirecting to:', redirectTo);
      router.replace(redirectTo);
    } else {
      console.log('[AuthProtection] ✅ Authenticated. Access granted.');
    }
  }, [isClient, router.isReady, effectiveIsAuthenticated, redirectTo, router]);

  // ✅ Show fallback during SSR or while still loading
  if (!isClient || isLoading || effectiveIsAuthenticated === undefined) {
    return <>{loadingFallback?.() ?? <p>⏳ Checking authentication…</p>}</>;
  }

  // ✅ Render protected children once confirmed
  return <>{children}</>;
}
