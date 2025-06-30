import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface NavigationPersistOptions<T> {
  key: string;
  defaultValue: T;
  initialState?: T;
  useSessionStorage?: boolean;
  clearOnLeave?: boolean;
}

export function useNavigationPersistedState<T>({
  key,
  defaultValue,
  initialState,
  useSessionStorage = true,
  clearOnLeave = false,
}: NavigationPersistOptions<T>): readonly [T, (val: T) => void] {
  const router = useRouter();
  const storage = typeof window !== 'undefined' && useSessionStorage ? sessionStorage : undefined;
  const storageKey = `stateforge:nav:${key}`;

  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialState ?? defaultValue;
    }

    try {
      const raw = storage?.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T) : (initialState ?? defaultValue);
    } catch (error) {
      console.warn('[stateforge] Failed to parse stored navigation state:', error);
      return initialState ?? defaultValue;
    }
  });

  // 🔁 Persist to storage on value change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      storage?.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.warn('[stateforge] Failed to persist navigation state:', error);
    }
  }, [value, storage, storageKey]);

  // 🧹 Clear on route change if enabled
  useEffect(() => {
    const cleanup = () => {
      if (clearOnLeave) {
        try {
          storage?.removeItem(storageKey);
        } catch (error) {
          console.warn('[stateforge] Failed to clear navigation state:', error);
        }
      }
    };

    router.events.on('routeChangeStart', cleanup);
    return () => {
      router.events.off('routeChangeStart', cleanup);
    };
  }, [router, storageKey, clearOnLeave]);

  return [value, setValue] as const;
}
