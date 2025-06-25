import type { AbstractAuthProvider } from '@/context/auth/AbstractAuthProvider';
import { describe, expect, it } from 'vitest';

const mockProvider: AbstractAuthProvider = {
  getUser: () => null,
  isLoading: () => false,
  login: async () => {},
  logout: async () => {},
  getToken: async () => 'token',
};

describe('AbstractAuthProvider contract', () => {
  it('conforms to the interface', async () => {
    expect(typeof mockProvider.login).toBe('function');
    expect(typeof mockProvider.logout).toBe('function');
    expect(typeof mockProvider.getUser).toBe('function');
    expect(typeof mockProvider.isLoading).toBe('function');

    if (mockProvider.getToken) {
      expect(await mockProvider.getToken()).toBe('token');
    }
  });
});
