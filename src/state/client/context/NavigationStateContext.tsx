'use client';

import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  NavigationState,
  NavigationStateContextType,
} from '@state/shared';

interface Router {
  events: {
    on(event: 'routeChangeStart', handler: () => void): void;
    off(event: 'routeChangeStart', handler: () => void): void;
  };
}

const NavigationStateContext = createContext<NavigationStateContextType | undefined>(undefined);

interface NavigationStateProviderProps {
  children: ReactNode;
  router: Router;
}

export const NavigationStateProvider = ({
  children,
  router,
}: NavigationStateProviderProps) => {
  const [navState, setNavState] = useState<NavigationState>({});

  useEffect(() => {
    const resetNavState = () => setNavState({});
    router.events.on('routeChangeStart', resetNavState);
    return () => {
      router.events.off('routeChangeStart', resetNavState);
    };
  }, [router]);

  return (
    <NavigationStateContext.Provider value={{ navState, setNavState }}>
      {children}
    </NavigationStateContext.Provider>
  );
};

export { NavigationStateContext };
