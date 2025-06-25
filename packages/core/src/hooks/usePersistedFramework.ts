import { useState, useEffect, useRef } from 'react';
import { PersistenceStrategy } from '@/types/PersistenceOptions';
import { createPersistenceStrategy } from '@/strategies/factory/createPersistenceStrategy';
import type { PersistenceStrategyBase } from '@/types/PersistenceOptions';

export interface PersistOptions<T> {
  key: string;
  defaultValue: T;
  strategy: PersistenceStrategy;
  namespace?: string;
}

export function usePersistedFramework<T>({
  key,
  defaultValue,
  strategy,
  namespace = 'app', // default namespace fallback
}: PersistOptions<T>): readonly [T, (val: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  // Use useRef to cache strategy instance
  const strategyRef = useRef<PersistenceStrategyBase<T>>(
    createPersistenceStrategy({ type: strategy, namespace })
  );

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await strategyRef.current.get(key);
        if (stored !== undefined && stored !== null) {
          setValue(stored);
        }
      } catch (error) {
        console.error(`[StateForge] Failed to load key "${key}":`, error);
      }
    };
    load();
  }, [key]);

  const update = (newValue: T) => {
    setValue(newValue);
    try {
      strategyRef.current.set(key, newValue);
    } catch (error) {
      console.error(`[StateForge] Failed to persist key "${key}":`, error);
    }
  };

  return [value, update] as const;
}
