import 'dotenv/config';
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
      console.log('Успешное подключение к хранилищу кэша.');
    });

    this.redis.on(
      'error',
      console.error.bind(console, 'Ошибка подключения к хранилищу кэша:'),
    );
  }

  async setCache(key: string, value: any, ttl: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async getCache(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async removeCache(key: string): Promise<number> {
    return await this.redis.del(key);
  }
}

const cache = new RedisService();
export default cache;
