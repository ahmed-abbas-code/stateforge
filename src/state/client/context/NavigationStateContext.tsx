'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/router';
import type {
  NavigationState,
  NavigationStateContextType,
} from '@state/state/shared';

const NavigationStateContext = createContext<NavigationStateContextType | undefined>(undefined);

export const NavigationStateProvider = ({ children }: { children: ReactNode }) => {
  const [navState, setNavState] = useState<NavigationState>({});
  const router = useRouter();

  useEffect(() => {
    const resetNavState = () => setNavState({});

    router.events.on('routeChangeStart', resetNavState);
    return () => {
      router.events.off('routeChangeStart', resetNavState);
    };
  }, [router.events]);

  return (
    <NavigationStateContext.Provider value={{ navState, setNavState }}>
      {children}
    </NavigationStateContext.Provider>
  );
};

export const useNavigationState = (): NavigationStateContextType => {
  const context = useContext(NavigationStateContext);
  if (!context) {
    throw new Error('useNavigationState must be used within a NavigationStateProvider');
  }
  return context;
};
