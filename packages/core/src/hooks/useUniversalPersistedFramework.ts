// packages/core/src/hooks/useUniversalPersistedFramework.ts
import { useState, useEffect, useRef } from 'react';
import type {
  PersistenceStrategy,
  PersistenceStrategyBase,
} from '../types/PersistenceOptions';
import { createUniversalPersistenceStrategy } from '../strategies/factory/createUniversalPersistenceStrategy';

export interface PersistOptions<T> {
  key: string;
  defaultValue: T;
  strategy: PersistenceStrategy;
  namespace?: string;
}

export function useUniversalPersistedFramework<T>({
  key,
  defaultValue,
  strategy,
  namespace = 'app',
}: PersistOptions<T>): readonly [T, (val: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const strategyRef = useRef<PersistenceStrategyBase<T> | null>(null);

  if (!strategyRef.current) {
    strategyRef.current = createUniversalPersistenceStrategy(strategy, namespace);
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
