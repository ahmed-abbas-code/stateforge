// src/state/client/context/NavigationStateContext.tsx

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { useRouter } from 'next/router';
import { NavigationState, NavigationStateContextType } from '@state/state/shared';

export const NavigationStateContext = createContext<NavigationStateContextType | undefined>(undefined);

export const NavigationStateProvider = ({ children }: { children: ReactNode }) => {
  const [navState, setNavState] = useState<NavigationState>({});
  const router = useRouter();

  // Optional cleanup: reset state on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setNavState({});
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

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
