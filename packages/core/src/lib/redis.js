"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const isDryRunEnv_1 = require("./isDryRunEnv");
const redis_1 = require("redis");
const envConfig_1 = require("./envConfig");
function createDummyRedisClient() {
    const mock = {
        connect: async () => { },
        disconnect: async () => { },
        get: async () => null,
        set: async () => { },
        on: () => { },
        isOpen: true,
    };
    return mock; // ✅ required double-cast
}
let redis;
if (isDryRunEnv_1.isDryRunEnv) {
    console.log('[DryRunMode] Skipping Redis client initialization');
    exports.redis = redis = createDummyRedisClient();
}
else {
    exports.redis = redis = (0, redis_1.createClient)({ url: envConfig_1.env.REDIS_URL });
    redis.on('error', (err) => {
        console.error('[Redis] Connection error:', err);
    });
    if (!redis.isOpen) {
        redis.connect().catch((err) => {
            console.error('[Redis] Failed to connect:', err);
        });
    }
}
