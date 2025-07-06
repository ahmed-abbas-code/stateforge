// src/state/shared/types/NavigationState.ts

import type { Dispatch, SetStateAction } from 'react';

export interface NavigationState {
  [key: string]: unknown;
}

export interface NavigationStateContextType {
  navState: NavigationState;
  setNavState: Dispatch<SetStateAction<NavigationState>>;
}
