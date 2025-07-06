// src/authentication/client/utils/withAuthProtection.tsx

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { ComponentType, JSX } from 'react';
import { useAuth } from '@authentication/auth/client/useAuth';

export function withAuthProtection<P extends JSX.IntrinsicAttributes>(
  WrappedComponent: ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace('/');
      }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
