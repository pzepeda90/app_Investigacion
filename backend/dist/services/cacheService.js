"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cache_1 = __importDefault(require("node-cache"));
const logger_1 = __importDefault(require("../config/logger"));
const config_1 = __importDefault(require("../config/config"));
class CacheService {
    constructor() {
        this.cache = new node_cache_1.default({
            stdTTL: config_1.default.cache.ttl,
            checkperiod: config_1.default.cache.checkperiod,
            useClones: false
        });
        this.cache.on('expired', (key, value) => {
            logger_1.default.info(`Cache entry expired: ${key}`);
        });
    }
    get(key) {
        return this.cache.get(key);
    }
    set(key, value, ttl) {
        if (ttl !== undefined && ttl <= 0) {
            logger_1.default.warn('Invalid TTL value, using default');
            ttl = config_1.default.cache.ttl;
        }
        return this.cache.set(key, value, ttl || config_1.default.cache.ttl);
    }
    del(key) {
        return this.cache.del(key);
    }
    flush() {
        this.cache.flushAll();
        logger_1.default.info('Cache flushed');
    }
    stats() {
        return this.cache.getStats();
    }
}
exports.default = new CacheService();
//# sourceMappingURL=cacheService.js.map