// src/authentication/client/components/AuthProtection.tsx

'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@authentication/client';

interface Props {
  children: ReactNode;
  redirectTo: string;
  loadingFallback?: () => ReactNode; // 👈 optional fallback renderer
}

export function AuthProtection({ children, redirectTo, loadingFallback }: Props) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  if (isLoading || !isAuthenticated) {
    return <>{loadingFallback?.() ?? <p>Checking authentication…</p>}</>;
  }

  return <>{children}</>;
}
