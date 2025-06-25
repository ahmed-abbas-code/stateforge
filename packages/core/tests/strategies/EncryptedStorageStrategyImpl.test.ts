/// <reference types="vitest" />

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EncryptedStorageStrategyImpl } from '@/strategies/implementations/EncryptedStorageStrategyImpl';
import * as CryptoJS from 'crypto-js';

// === Mocks ===
vi.mock('@/utils/getRequiredEnv', () => ({
  getRequiredEnv: vi.fn(() => 'test-secret'),
}));

vi.mock('crypto-js', () => {
  const AES = {
    encrypt: vi.fn((_val: string, _key: string) => ({
      toString: () => 'mocked-encrypted-value',
    })),
    decrypt: vi.fn((_val: string, _key: string) => ({
      toString: () => '"abc"',
    })),
  };

  return {
    default: { AES, enc: { Utf8: 'Utf8' } },
    AES,
    enc: { Utf8: 'Utf8' },
  };
});

describe('EncryptedStorageStrategyImpl', () => {
  const testKey = 'userToken';
  const testNamespace = 'secure-store';
  const encryptedKey = `${testNamespace}:${testKey}`;
  const testValue = 'abc';
  let strategy: EncryptedStorageStrategyImpl<string>;

  beforeEach(() => {
    vi.restoreAllMocks();

    const store: Record<string, string> = {};
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          Object.keys(store).forEach(k => delete store[k]);
        }),
        key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
        get length() {
          return Object.keys(store).length;
        },
      } as Storage,
      writable: true,
    });

    strategy = new EncryptedStorageStrategyImpl<string>(testNamespace);
  });

  it('encrypts and saves to localStorage', async () => {
    await strategy.set(testKey, testValue);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      encryptedKey,
      'mocked-encrypted-value'
    );
  });

  it('decrypts and loads from localStorage', async () => {
    (localStorage.getItem as vi.Mock).mockReturnValue('mocked-encrypted-value');
    const result = await strategy.get(testKey);
    expect(result).toBe('abc');
  });

  it('returns undefined if localStorage returns null', async () => {
    (localStorage.getItem as vi.Mock).mockReturnValue(null);
    const result = await strategy.get(testKey);
    expect(result).toBeUndefined();
  });

  it('returns undefined if decryption fails (empty string)', async () => {
    const decryptMock = CryptoJS.AES.decrypt as unknown as ReturnType<typeof vi.fn>;
    decryptMock.mockReturnValueOnce({ toString: () => '' }); // simulate failure
    (localStorage.getItem as vi.Mock).mockReturnValue('mocked-encrypted-value');

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await strategy.get(testKey);

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      `[EncryptedStorage] Failed to decrypt key "${testKey}":`,
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('logs error if encryption throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(JSON, 'stringify').mockImplementationOnce(() => {
      throw new Error('fail');
    });

    await strategy.set(testKey, testValue);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('logs error if decryption throws during JSON.parse', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (localStorage.getItem as vi.Mock).mockReturnValue('mocked-encrypted-value');
    vi.spyOn(JSON, 'parse').mockImplementationOnce(() => {
      throw new Error('parse error');
    });

    const result = await strategy.get(testKey);
    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
