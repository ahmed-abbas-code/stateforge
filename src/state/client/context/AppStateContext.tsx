'use client';

import { createContext, useState, type ReactNode } from 'react';
import type { AppSharedState, AppStateContextType } from '@state/shared';

const defaultState: AppSharedState = {
  hydrated: false,
  lastUpdated: '',
};

export const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider = ({ children }: AppStateProviderProps) => {
  const [appSharedState, setAppSharedState] = useState<AppSharedState>(defaultState);

  return (
    <AppStateContext.Provider value={{ appSharedState, setAppSharedState }}>
      {children}
    </AppStateContext.Provider>
  );
};
