"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
(0, vitest_1.beforeAll)(() => {
    vitest_1.vi.spyOn(console, 'warn').mockImplementation(() => { });
    const store = {};
    globalThis.localStorage = {
        getItem: vitest_1.vi.fn((key) => (key in store ? store[key] : null)),
        setItem: vitest_1.vi.fn((key, value) => {
            store[key] = value;
        }),
        removeItem: vitest_1.vi.fn((key) => {
            delete store[key];
        }),
        clear: vitest_1.vi.fn(() => {
            for (const key in store) {
                delete store[key];
            }
        }),
        key: vitest_1.vi.fn((index) => Object.keys(store)[index] ?? null),
        get length() {
            return Object.keys(store).length;
        }
    };
});
