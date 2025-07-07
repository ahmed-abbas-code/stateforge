'use client';

import { useContext } from 'react';
import { AppStateContext } from '../context/AppStateContext';
import type { AppStateContextType } from '@state/shared';

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
