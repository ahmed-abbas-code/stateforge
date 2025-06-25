/// <reference types="vitest" />
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Mock } from 'vitest'; 
import { LocalStorageStrategyImpl } from '@/strategies/implementations/LocalStorageStrategyImpl';

describe('LocalStorageStrategyImpl', () => {
  const testNamespace = 'test-key';
  let strategy: LocalStorageStrategyImpl<string>;

  beforeEach(() => {
    vi.restoreAllMocks();

    const store: Record<string, string> = {};

    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          for (const key in store) {
            delete store[key];
          }
        }),
        key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
        get length() {
          return Object.keys(store).length;
        }
      } as Storage,
      writable: true,
    });

    strategy = new LocalStorageStrategyImpl<string>(testNamespace);
  });

  it('saves data to localStorage', async () => {
    await strategy.save('abc'); // uses default key "value"
    expect(localStorage.setItem).toHaveBeenCalledWith(
      `${testNamespace}:value`,
      '"abc"'
    );
  });

  it('loads data from localStorage', async () => {
    (localStorage.getItem as Mock).mockReturnValue('"abc"'); // ✅ Fixed
    const result = await strategy.load();
    expect(result).toBe('abc');
  });

  it('returns undefined when nothing is stored', async () => {
    (localStorage.getItem as Mock).mockReturnValue(null); // ✅ Fixed
    const result = await strategy.load();
    expect(result).toBeUndefined();
  });
});
