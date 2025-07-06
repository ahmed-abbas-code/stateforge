// src/state/shared/types/AppState.ts

import type { Dispatch, SetStateAction } from 'react';

export interface AppSharedState {
  hydrated: boolean;
  lastUpdated: string;
  userRole?: 'admin' | 'user' | 'guest';
  theme?: 'light' | 'dark';
  darkMode?: boolean;
}

export interface AppStateContextType {
  appSharedState: AppSharedState;
  setAppSharedState: Dispatch<SetStateAction<AppSharedState>>;
}
