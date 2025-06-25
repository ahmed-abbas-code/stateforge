/// <reference types="vitest" />
import { renderHook, act } from '@testing-library/react';
import { useNavigationPersistedState } from '@/hooks/useNavigationPersistedState';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { useRouter } from 'next/router';

vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

describe('useNavigationPersistedState', () => {
  const key = 'currentPage';
  const defaultValue = 'home';
  const routeEvents = { on: vi.fn(), off: vi.fn() };
  const storageKey = `stateforge:nav:${key}`;

  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.clearAllMocks();

    (useRouter as unknown as Mock).mockReturnValue({ events: routeEvents });

    Object.defineProperty(globalThis, 'sessionStorage', {
      value: {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, val: string) => {
          store[key] = val;
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
      },
      writable: true,
    });
  });

  it('hydrates from sessionStorage if value exists', () => {
    store[storageKey] = JSON.stringify('dashboard');

    const { result } = renderHook(() =>
      useNavigationPersistedState<string>({ key, defaultValue })
    );

    expect(result.current[0]).toBe('dashboard');
  });

  it('returns defaultValue if nothing is in sessionStorage', () => {
    const { result } = renderHook(() =>
      useNavigationPersistedState<string>({ key, defaultValue })
    );

    expect(result.current[0]).toBe('home');
  });

  it('sets new value and persists it', () => {
    const { result } = renderHook(() =>
      useNavigationPersistedState<string>({ key, defaultValue })
    );

    act(() => {
      result.current[1]('settings');
    });

    expect(result.current[0]).toBe('settings');
    expect(JSON.parse(store[storageKey])).toBe('settings');
  });

  it('clears sessionStorage on route change if clearOnLeave is true', () => {
    renderHook(() =>
      useNavigationPersistedState<string>({ key, defaultValue, clearOnLeave: true })
    );

    expect(routeEvents.on).toHaveBeenCalledWith('routeChangeStart', expect.any(Function));
  });

  it('does not clear sessionStorage on route change if clearOnLeave is false', () => {
    renderHook(() =>
      useNavigationPersistedState<string>({ key, defaultValue, clearOnLeave: false })
    );

    expect(routeEvents.on).not.toHaveBeenCalledWith('routeChangeStart', expect.any(Function));
  });

  it('hydrates from initialState in SSR', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error
    delete globalThis.window;

    const { result } = renderHook(() =>
      useNavigationPersistedState<string>({
        key,
        defaultValue,
        initialState: 'ssrValue',
      })
    );

    expect(result.current[0]).toBe('ssrValue');

    globalThis.window = originalWindow;
  });
});
