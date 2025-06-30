

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistedFramework } from '@/hooks/usePersistedFramework';
import type { PersistenceStrategyBase } from '@/types/PersistenceOptions';

const getMock: Mock<(key: string) => Promise<string | undefined>> = vi.fn();
const setMock: Mock<(key: string, val: string) => Promise<void>> = vi.fn();

const mockStrategy: PersistenceStrategyBase<string> = {
  get: getMock,
  set: setMock,
};


describe('usePersistedFramework', () => {
  const testKey = 'user';

  beforeEach(() => {
    getMock.mockReset();
    setMock.mockReset();
  });

  it('hydrates from strategy if available', async () => {
    getMock.mockResolvedValueOnce('persisted-user');

    const { result } = renderHook(() =>
      usePersistedFramework<string>({
        key: testKey,
        defaultValue: 'default-user',
        strategy: mockStrategy,
      })
    );

    await new Promise(resolve => setTimeout(resolve));

    expect(result.current[0]).toBe('persisted-user');
    expect(getMock).toHaveBeenCalledWith(testKey);
  });

  it('falls back to defaultValue if strategy returns undefined', async () => {
    getMock.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() =>
      usePersistedFramework<string>({
        key: testKey,
        defaultValue: 'default-user',
        strategy: mockStrategy,
      })
    );

    await new Promise(resolve => setTimeout(resolve));

    expect(result.current[0]).toBe('default-user');
  });

  it('updates value and persists via strategy.set', async () => {
    getMock.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() =>
      usePersistedFramework<string>({
        key: testKey,
        defaultValue: 'default-user',
        strategy: mockStrategy,
      })
    );

    await new Promise(resolve => setTimeout(resolve));

    act(() => {
      result.current[1]('updated-user');
    });

    expect(result.current[0]).toBe('updated-user');
    expect(setMock).toHaveBeenCalledWith(testKey, 'updated-user');
  });

  it('does not crash in SSR environment', async () => {
    const originalWindow = globalThis.window;
    // simulate SSR
    // @ts-expect-error simulating SSR by removing window
    delete globalThis.window;

    getMock.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() =>
      usePersistedFramework<string>({
        key: testKey,
        defaultValue: 'ssr-user',
        strategy: mockStrategy,
      })
    );

    await new Promise(resolve => setTimeout(resolve));

    expect(result.current[0]).toBe('ssr-user');

    // restore
    globalThis.window = originalWindow;
  });
});
