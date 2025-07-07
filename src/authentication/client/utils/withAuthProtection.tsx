'use client';

import { useAuth } from '@authentication/client/useAuth';
import { useEffect } from 'react';
import type { ComponentType, JSX } from 'react';

interface Router {
  replace: (path: string) => void;
}

interface WithRouterProps {
  router: Router;
}

/**
 * Higher-order component to protect pages behind authentication.
 */
export function withAuthProtection<P extends JSX.IntrinsicAttributes>(
  WrappedComponent: ComponentType<P>
) {
  const ProtectedComponent = (props: P & WithRouterProps) => {
    const { isAuthenticated, isLoading } = useAuth();
    const { router, ...rest } = props;

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace('/');
      }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...(rest as unknown as P)} />;
  };

  ProtectedComponent.displayName = `WithAuthProtection(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ProtectedComponent;
}
