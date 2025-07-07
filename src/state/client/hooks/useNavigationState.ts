'use client';

import { useContext } from 'react';
import { NavigationStateContext } from '../context/NavigationStateContext';
import type { NavigationStateContextType } from '@state/shared';

export const useNavigationState = (): NavigationStateContextType => {
  const context = useContext(NavigationStateContext);
  if (!context) {
    throw new Error('useNavigationState must be used within a NavigationStateProvider');
  }
  return context;
};
