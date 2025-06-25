import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface NavigationPersistOptions<T> {
  key: string;
  defaultValue: T;
  initialState?: T;              // ✅ new: SSR-injected state
  useSessionStorage?: boolean;  // defaults to true
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
      // SSR: use passed-in value or default
      return initialState ?? defaultValue;
    }

    try {
      const raw = storage?.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T) : (initialState ?? defaultValue);
    } catch {
      return initialState ?? defaultValue;
    }
  });

  // 🔁 Persist to storage on value change (client only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      storage?.setItem(storageKey, JSON.stringify(value));
    } catch {}
  }, [value]);

  // 🧹 Cleanup on route change if enabled
  useEffect(() => {
    const cleanup = () => {
      if (clearOnLeave) {
        try {
          storage?.removeItem(storageKey);
        } catch {}
      }
    };

    router.events.on('routeChangeStart', cleanup);
    return () => {
      router.events.off('routeChangeStart', cleanup);
    };
  }, [router, storageKey, clearOnLeave]);

  return [value, setValue] as const;
}
