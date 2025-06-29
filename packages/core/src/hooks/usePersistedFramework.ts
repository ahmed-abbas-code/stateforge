import { useState, useEffect, useRef } from 'react';
import { createBrowserPersistenceStrategy } from '../strategies/factory/createBrowserPersistenceStrategy';
import type { PersistenceStrategyBase } from '../types/PersistenceOptions';

// Define only the browser-compatible strategies
type BrowserPersistenceStrategy = 'localStorage' | 'navigationState';

export interface PersistOptions<T> {
  key: string;
  defaultValue: T;
  strategy: BrowserPersistenceStrategy;
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

  // Only create strategy once
  if (!strategyRef.current) {
    strategyRef.current = createBrowserPersistenceStrategy<T>(strategy, namespace);
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
