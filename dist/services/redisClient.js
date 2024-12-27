"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = void 0;
const redis_1 = require("redis");
class RedisService {
    constructor() {
        this.client = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        this.client.on('error', (err) => {
            console.error('Redis Client Error', err);
        });
    }
    getRedisClient() {
        return this.client;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.isOpen) {
                yield this.client.connect();
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client.isOpen) {
                yield this.client.quit();
            }
        });
    }
    // Updated method to support expiration
    set(key, value, mode, duration) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connect();
            if (mode && duration !== undefined) {
                yield this.client.set(key, value, {
                    [mode]: duration
                });
            }
            else {
                yield this.client.set(key, value);
            }
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connect();
            return this.client.get(key);
        });
    }
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connect();
            yield this.client.del(key);
        });
    }
}
const redisService = new RedisService();
const getRedisClient = () => redisService.getRedisClient();
exports.getRedisClient = getRedisClient;
exports.default = redisService;
