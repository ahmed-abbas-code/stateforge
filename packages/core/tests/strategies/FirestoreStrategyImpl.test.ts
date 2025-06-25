/// <reference types="vitest" />

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FirestoreStrategyImpl } from '@/strategies/implementations/FirestoreStrategyImpl';
import { firestore } from '@/lib/firestore';

vi.mock('@/lib/firestore', () => {
  const getMock = vi.fn();
  const setMock = vi.fn();

  const docMock = vi.fn(() => ({
    get: getMock,
    set: setMock,
  }));

  const collectionMock = vi.fn(() => ({
    doc: docMock,
  }));

  return {
    firestore: {
      collection: collectionMock,
    },
  };
});

describe('FirestoreStrategyImpl', () => {
  const key = 'testKey';
  const value = 'testValue';
  let strategy: FirestoreStrategyImpl<string>;

  const collectionMock = firestore.collection as unknown as vi.Mock;
  const docMock = vi.fn();
  const getMock = vi.fn();
  const setMock = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();

    collectionMock.mockReturnValue({
      doc: docMock.mockReturnValue({
        get: getMock,
        set: setMock,
      }),
    });

    strategy = new FirestoreStrategyImpl<string>('testCollection');
  });

  it('sets value in Firestore', async () => {
    await strategy.set(key, value);
    expect(setMock).toHaveBeenCalledWith({ value }, { merge: true });
  });

  it('gets value from Firestore', async () => {
    getMock.mockResolvedValue({
      exists: true,
      data: () => ({ value }),
    });

    const result = await strategy.get(key);
    expect(result).toBe(value);
  });

  it('returns undefined if document does not exist', async () => {
    getMock.mockResolvedValue({
      exists: false,
    });

    const result = await strategy.get(key);
    expect(result).toBeUndefined();
  });

  it("returns undefined if document exists but 'value' is missing", async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    getMock.mockResolvedValue({
      exists: true,
      data: () => ({ somethingElse: 123 }),
    });

    const result = await strategy.get(key);
    expect(result).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('logs error and returns undefined if get() throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    getMock.mockRejectedValue(new Error('Firestore get failure'));

    const result = await strategy.get(key);
    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('logs error if set() throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setMock.mockRejectedValue(new Error('Firestore set failure'));

    await strategy.set(key, value);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
