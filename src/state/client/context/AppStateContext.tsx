// src/state/client/context/AppStateContext.tsx

import { AppSharedState, AppStateContextType } from '@state/shared';
import React from 'react';
import { createContext, useContext, useState, ReactNode } from 'react';
// import { AppSharedState, AppStateContextType } from '../../types/AppState';

const defaultState: AppSharedState = {
  hydrated: false,
  lastUpdated: '',
};

export const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [appSharedState, setAppSharedState] = useState<AppSharedState>(defaultState);

  return (
    <AppStateContext.Provider value={{ appSharedState, setAppSharedState }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
