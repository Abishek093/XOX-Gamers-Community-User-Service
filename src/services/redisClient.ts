import { createClient } from "redis";

class RedisService {
  private client;


  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://redis-stack:6379',
      socket: {
        connectTimeout: 10000, // 10 seconds
        reconnectStrategy: (retries) => {
          if (retries > 5) return new Error('Too many attempts to reconnect');
          return Math.min(retries * 1000, 30000);
        }
      }
    });

    this.client.on('error', (err: Error) => {
      console.error('Redis Client Error', err);
    });
  }

  getRedisClient() {
    return this.client;
  }

  async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  // Updated method to support expiration
  async set(
    key: string,
    value: string,
    mode?: 'EX' | 'PX' | 'EXAT' | 'PXAT' | 'KEEPTTL',
    duration?: number
  ): Promise<void> {
    await this.connect();

    if (mode && duration !== undefined) {
      await this.client.set(key, value, {
        [mode]: duration
      });
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    await this.connect();
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.connect();
    await this.client.del(key);
  }
}

const redisService = new RedisService();
export const getRedisClient = () => redisService.getRedisClient();
export default redisService;