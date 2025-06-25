/// <reference types="vitest" />
import { renderHook, act } from '@testing-library/react';
import { usePersistedFramework } from '@/hooks/usePersistedFramework';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ✅ Properly typed mocked strategy
const mockStrategy = {
  get: vi.fn<[string], Promise<string | undefined>>(),
  set: vi.fn<[string, string], Promise<void>>(),
};

describe('usePersistedFramework', () => {
  const testKey = 'user';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hydrates from strategy if available', async () => {
    mockStrategy.get.mockResolvedValueOnce('persisted-user');

    const { result } = renderHook(() =>
      usePersistedFramework<string>({
        key: testKey,
        defaultValue: 'default-user',
        strategy: mockStrategy,
      })
    );

    // Allow hydration effect to run
    await new Promise(resolve => setTimeout(resolve));

    expect(result.current[0]).toBe('persisted-user');
    expect(mockStrategy.get).toHaveBeenCalledWith(testKey);
  });

  it('falls back to defaultValue if strategy returns undefined', async () => {
    mockStrategy.get.mockResolvedValueOnce(undefined);

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
    mockStrategy.get.mockResolvedValueOnce(undefined);

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
    expect(mockStrategy.set).toHaveBeenCalledWith(testKey, 'updated-user');
  });

  it('does not crash in SSR environment', async () => {
    const originalWindow = globalThis.window;
    // simulate SSR
    // @ts-expect-error
    delete globalThis.window;

    mockStrategy.get.mockResolvedValueOnce(undefined);

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
