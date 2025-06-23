import { useState, useEffect } from 'react';
import { getPersistenceStrategy } from '../strategies/factory/createPersistenceStrategy';
import { PersistenceStrategy } from '../types/persistence';

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

  useEffect(() => {
    const load = async () => {
      try {
        const persistence = getPersistenceStrategy<T>(strategy);
        const stored = await persistence.get(key);
        if (stored !== undefined && stored !== null) {
          setValue(stored);
        }
      } catch (error) {
        console.error(`[StateForge] Failed to load key "${key}":`, error);
      }
    };
    load();
  }, [key, strategy]);

  const update = (newValue: T) => {
    setValue(newValue);
    try {
      const persistence = getPersistenceStrategy<T>(strategy);
      persistence.set(key, newValue);
    } catch (error) {
      console.error(`[StateForge] Failed to persist key "${key}":`, error);
    }
  };

  return [value, update] as const;
}
