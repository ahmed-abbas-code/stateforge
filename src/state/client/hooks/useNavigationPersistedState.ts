// src/state/client/hooks/useNavigationPersistedState.ts

'use client'

import { useState, useEffect } from 'react'

interface Router {
  events: {
    on(event: 'routeChangeStart', handler: () => void): void
    off(event: 'routeChangeStart', handler: () => void): void
  }
}

interface NavigationPersistOptions<T> {
  key: string
  defaultValue: T
  initialState?: T
  useSessionStorage?: boolean
  clearOnLeave?: boolean
  router?: Router
}

export function useNavigationPersistedState<T>({
  key,
  defaultValue,
  initialState,
  useSessionStorage = true,
  clearOnLeave = false,
  router,
}: NavigationPersistOptions<T>): readonly [
  T,
  (val: T | ((prev: T) => T)) => void,
  () => void
] {
  const storageKey = `stateforge:nav:${key}`
  const storage =
    typeof window !== 'undefined' && useSessionStorage ? sessionStorage : undefined

  const [value, setInternalValue] = useState<T>(() => {
    if (typeof window === 'undefined' || !storage) {
      return initialState ?? defaultValue
    }

    try {
      const raw = storage.getItem(storageKey)
      return raw ? (JSON.parse(raw) as T) : (initialState ?? defaultValue)
    } catch (err) {
      console.warn('[stateforge] Failed to parse navigation state:', err)
      return initialState ?? defaultValue
    }
  })

  // Wrapped setter to support function-style updates
  const setValue = (valOrUpdater: T | ((prev: T) => T)) => {
    const nextValue =
      typeof valOrUpdater === 'function'
        ? (valOrUpdater as (prev: T) => T)(value)
        : valOrUpdater

    setInternalValue(nextValue)
  }

  // Persist state to sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !storage) return

    try {
      storage.setItem(storageKey, JSON.stringify(value))
    } catch (err) {
      console.warn('[stateforge] Failed to persist navigation state:', err)
    }
  }, [value]) // ✅ FIXED: removed JSON.stringify(value)

  // Cleanup on route change if enabled
  useEffect(() => {
    if (typeof window === 'undefined' || !storage || !clearOnLeave || !router) return

    const cleanup = () => {
      try {
        storage.removeItem(storageKey)
      } catch (err) {
        console.warn('[stateforge] Failed to clear navigation state:', err)
      }
    }

    router.events.on('routeChangeStart', cleanup)
    return () => {
      router.events.off('routeChangeStart', cleanup)
    }
  }, [clearOnLeave, router, storageKey, storage])

  const clear = () => {
    try {
      storage?.removeItem(storageKey)
    } catch (err) {
      console.warn('[stateforge] Failed to clear navigation state:', err)
    }
  }

  return [value, setValue, clear] as const
}
