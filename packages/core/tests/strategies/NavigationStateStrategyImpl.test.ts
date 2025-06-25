import { describe, it, beforeEach, expect, vi } from 'vitest';
import { NavigationStateStrategyImpl } from '@/strategies/implementations/NavigationStateStrategyImpl';

const testNS = 'testNS';
const testKey = 'currentPage';
const testValue = { page: 'home' };

describe('NavigationStateStrategyImpl', () => {
  let strategy: NavigationStateStrategyImpl<typeof testValue>;

  beforeEach(() => {
    vi.restoreAllMocks();
    strategy = new NavigationStateStrategyImpl<typeof testValue>(testNS);

    Object.defineProperty(globalThis, 'sessionStorage', {
      value: {
        store: {} as Record<string, string>,
        getItem: vi.fn(function (this: any, key: string) {
          return this.store[key] || null;
        }),
        setItem: vi.fn(function (this: any, key: string, value: string) {
          this.store[key] = value;
        }),
        clear: vi.fn(function (this: any) {
          this.store = {};
        }),
        removeItem: vi.fn(function (this: any, key: string) {
          delete this.store[key];
        }),
      },
      writable: true
    });
  });

  it('saves data to sessionStorage', async () => {
    await strategy.set(testKey, testValue);
    const expectedKey = `__nav_state__:${testNS}:${testKey}`;
    expect(sessionStorage.setItem).toHaveBeenCalledWith(expectedKey, JSON.stringify(testValue));
  });

  it('loads data from sessionStorage', async () => {
    const expectedKey = `__nav_state__:${testNS}:${testKey}`;
    (sessionStorage.getItem as vi.Mock).mockReturnValueOnce(JSON.stringify(testValue));
    const result = await strategy.get(testKey);
    expect(result).toEqual(testValue);
  });

  it('returns undefined when key does not exist', async () => {
    (sessionStorage.getItem as vi.Mock).mockReturnValueOnce(null);
    const result = await strategy.get(testKey);
    expect(result).toBeUndefined();
  });

  it('handles malformed JSON gracefully', async () => {
    const expectedKey = `__nav_state__:${testNS}:${testKey}`;
    (sessionStorage.getItem as vi.Mock).mockReturnValueOnce('{invalid json');

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await strategy.get(testKey);
    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledOnce();
    consoleSpy.mockRestore();
  });
});
