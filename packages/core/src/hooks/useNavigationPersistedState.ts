import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface NavigationPersistOptions<T> {
  key: string;
  defaultValue: T;
  useSessionStorage?: boolean; // defaults to true
  clearOnLeave?: boolean;
}

export function useNavigationPersistedState<T>({
  key,
  defaultValue,
  useSessionStorage = true,
  clearOnLeave = false,
}: NavigationPersistOptions<T>): readonly [T, (val: T) => void] {
  const router = useRouter();
  const storage = useSessionStorage ? sessionStorage : undefined;

  const storageKey = `stateforge:nav:${key}`;

  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const raw = storage?.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    storage?.setItem(storageKey, JSON.stringify(value));
  }, [value]);

  useEffect(() => {
    const cleanup = () => {
      if (clearOnLeave) {
        storage?.removeItem(storageKey);
      }
    };
    router.events.on('routeChangeStart', cleanup);
    return () => {
      router.events.off('routeChangeStart', cleanup);
    };
  }, [router, storageKey, clearOnLeave]);

  return [value, setValue] as const;
}
