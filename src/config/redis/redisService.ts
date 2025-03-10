import Redis from 'ioredis';
import { readFileSync } from 'fs';

class RedisService {
  private readonly redis: Redis;
  constructor() {
    const password = process.env.REDIS_PASSWORD ?? '';
    this.redis = new Redis({
      host: 'redis',
      port: 6379,
      password,
      tls: {
        ca: readFileSync('certs/ca.pem'),
        cert: readFileSync('certs/client-cert.pem'),
        key: readFileSync('certs/client-key.pem'),
        rejectUnauthorized: false,
      },
    });

    this.redis.once('connect', () => {
      console.log('Connected to Redis successfully!');
    });

    this.redis.on(
      'error',
      console.error.bind(console, 'Error connecting to Redis:'),
    );
  }

  async setCache(key: string, value: any, ttl: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async getCache(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }
}

const cache = new RedisService();
export default cache;
