/// <reference types="vitest" />
import { describe, it, beforeEach, expect, vi } from 'vitest';
import type { Mock } from 'vitest'; 
import { RedisServerStrategyImpl } from '@/strategies/implementations/RedisServerStrategyImpl';
import { redis } from '@/lib/redis';

vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    setEx: vi.fn()
  }
}));

describe('RedisServerStrategyImpl', () => {
  const testNS = 'testNamespace';
  const testKey = 'userToken';
  const testValue = { token: 'abc123' };
  let strategy: RedisServerStrategyImpl<typeof testValue>;

  beforeEach(() => {
    vi.restoreAllMocks();
    strategy = new RedisServerStrategyImpl<typeof testValue>(testNS);
  });

  it('saves value with set if no TTL', async () => {
    await strategy.set(testKey, testValue);
    expect(redis.set).toHaveBeenCalledWith(`${testNS}:${testKey}`, JSON.stringify(testValue));
  });

  it('saves value with setEx if TTL provided', async () => {
    const ttl = 3600;
    const ttlStrategy = new RedisServerStrategyImpl<typeof testValue>(testNS, ttl);
    await ttlStrategy.set(testKey, testValue);
    expect(redis.setEx).toHaveBeenCalledWith(`${testNS}:${testKey}`, ttl, JSON.stringify(testValue));
  });

  it('retrieves and parses stored value', async () => {
    (redis.get as Mock).mockResolvedValueOnce(JSON.stringify(testValue)); // ✅ Use Mock
    const result = await strategy.get(testKey);
    expect(result).toEqual(testValue);
  });

  it('returns undefined if key is not found', async () => {
    (redis.get as Mock).mockResolvedValueOnce(null); // ✅ Use Mock
    const result = await strategy.get(testKey);
    expect(result).toBeUndefined();
  });

  it('returns undefined on JSON parse error', async () => {
    (redis.get as Mock).mockResolvedValueOnce('{bad json'); // ✅ Use Mock
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await strategy.get(testKey);
    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledOnce();
    consoleSpy.mockRestore();
  });
});
