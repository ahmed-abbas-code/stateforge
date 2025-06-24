import { useState, useEffect, useRef } from 'react';
import { PersistenceStrategy } from '@/types/PersistenceOptions';

export interface PersistOptions<T> {
  key: string;
  defaultValue: T;
  strategy: PersistenceStrategy;
}

export function usePersistedFramework<T>({
  key,
  defaultValue,
  strategy,
}: PersistOptions<T>): readonly [T, (val: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const strategyRef = useRef(getPersistenceStrategy<T>(strategy));

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
function getPersistenceStrategy<T>(strategy: string): any {
  throw new Error('Function not implemented.');
}

