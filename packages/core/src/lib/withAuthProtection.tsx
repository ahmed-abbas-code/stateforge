import React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../context/auth/AuthContext';
import type { ComponentType, JSX } from 'react';

export function withAuthProtection<P extends JSX.IntrinsicAttributes>(
  WrappedComponent: ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.replace('/');
      }
    }, [loading, isAuthenticated, router]);

    if (loading || !isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
