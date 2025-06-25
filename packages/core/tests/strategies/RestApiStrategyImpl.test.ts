/// <reference types="vitest" />

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RestApiStrategyImpl } from '@/strategies/implementations/RestApiStrategyImpl';
import { fetchAppApi } from '@/utils/fetchAppApi';

vi.mock('@/utils/fetchAppApi', () => ({
  fetchAppApi: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('RestApiStrategyImpl', () => {
  const testNS = 'testNamespace';
  const testKey = 'userToken';
  const testValue = { id: 'abc123' };
  let strategy: RestApiStrategyImpl<typeof testValue>;

  const getMock = fetchAppApi.get as vi.Mock;
  const postMock = fetchAppApi.post as vi.Mock;

  beforeEach(() => {
    vi.restoreAllMocks();
    strategy = new RestApiStrategyImpl<typeof testValue>(testNS);
  });

  it('saves value via POST', async () => {
    await strategy.set(testKey, testValue);
    expect(postMock).toHaveBeenCalledWith(`/state/${testNS}:${testKey}`, { value: testValue });
  });

  it('retrieves value via GET', async () => {
    getMock.mockResolvedValueOnce({
      data: { value: testValue },
    });

    const result = await strategy.get(testKey);
    expect(result).toEqual(testValue);
  });

  it('returns undefined if GET response has no value', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    getMock.mockResolvedValueOnce({ data: {} });

    const result = await strategy.get(testKey);
    expect(result).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('returns undefined and logs error if GET fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    getMock.mockRejectedValueOnce(new Error('API get error'));

    const result = await strategy.get(testKey);
    expect(result).toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it('logs error if POST fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    postMock.mockRejectedValueOnce(new Error('API post error'));

    await strategy.set(testKey, testValue);
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
