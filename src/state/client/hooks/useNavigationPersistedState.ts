'use client';

import { useState, useEffect } from 'react';

interface Router {
  events: {
    on(event: 'routeChangeStart', handler: () => void): void;
    off(event: 'routeChangeStart', handler: () => void): void;
  };
}

interface NavigationPersistOptions<T> {
  key: string;
  defaultValue: T;
  initialState?: T;
  useSessionStorage?: boolean;
  clearOnLeave?: boolean;
  router?: Router;
}

export function useNavigationPersistedState<T>({
  key,
  defaultValue,
  initialState,
  useSessionStorage = true,
  clearOnLeave = false,
  router,
}: NavigationPersistOptions<T>): readonly [T, (val: T) => void] {
  const storageKey = `stateforge:nav:${key}`;
  const storage =
    typeof window !== 'undefined' && useSessionStorage
      ? sessionStorage
      : undefined;

  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined' || !storage) {
      return initialState ?? defaultValue;
    }

    try {
      const raw = storage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T) : (initialState ?? defaultValue);
    } catch (err) {
      console.warn('[stateforge] Failed to parse navigation state:', err);
      return initialState ?? defaultValue;
    }
  });

  // Persist state to sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !storage) return;

    try {
      storage.setItem(storageKey, JSON.stringify(value));
    } catch (err) {
      console.warn('[stateforge] Failed to persist navigation state:', err);
    }
  }, [value, storageKey, storage]);

  // Cleanup on route change if enabled
  useEffect(() => {
    if (typeof window === 'undefined' || !storage || !clearOnLeave || !router) return;

    const cleanup = () => {
      try {
        storage.removeItem(storageKey);
      } catch (err) {
        console.warn('[stateforge] Failed to clear navigation state:', err);
      }
    };

    router.events.on('routeChangeStart', cleanup);
    return () => {
      router.events.off('routeChangeStart', cleanup);
    };
  }, [clearOnLeave, router, storageKey, storage]);

  return [value, setValue] as const;
}
