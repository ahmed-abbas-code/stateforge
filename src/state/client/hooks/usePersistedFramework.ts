// src/state/client/hooks/usePersistedFramework.ts

import { useState, useEffect, useRef } from 'react';
import { PersistenceStrategyBase } from '@state/shared';
import { createBrowserPersistenceStrategy } from '@state/client';

type BrowserPersistenceStrategy = 'localStorage' | 'navigationState';

export interface PersistOptions<T> {
  key: string;
  defaultValue: T;
  strategy: BrowserPersistenceStrategy | PersistenceStrategyBase<T>;
  namespace?: string;
}

export function usePersistedFramework<T>({
  key,
  defaultValue,
  strategy,
  namespace = 'app',
}: PersistOptions<T>): readonly [T, (val: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const strategyRef = useRef<PersistenceStrategyBase<T> | null>(null);

  if (!strategyRef.current) {
    // ✅ Narrow the type before calling createBrowserPersistenceStrategy
    strategyRef.current =
      typeof strategy === 'string'
        ? createBrowserPersistenceStrategy<T>(strategy, namespace)
        : strategy;
  }

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const stored = await strategyRef.current!.get(key);
        if (isMounted && stored !== undefined && stored !== null) {
          setValue(stored);
        }
      } catch (error) {
        console.error(`[StateForge] Failed to load key "${key}":`, error);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [key]);

  const update = (newValue: T) => {
    setValue(newValue);
    try {
      strategyRef.current!.set(key, newValue);
    } catch (error) {
      console.error(`[StateForge] Failed to persist key "${key}":`, error);
    }
  };

  return [value, update] as const;
}
