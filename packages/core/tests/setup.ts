import { beforeAll, vi } from 'vitest';

beforeAll(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => { });

  const store: Record<string, string> = {};

  globalThis.localStorage = {
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
  } as Storage;
});
