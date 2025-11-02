import 'dotenv/config';
import Redis from 'ioredis';
import { readFileSync } from 'fs';
import {
  type IBotNotificationMessage,
  type IBotAdsMessage,
} from 'config/types';

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

  getClient(): Redis {
    return this.redis;
  }

  async sendAdsToBot({ ...data }: IBotAdsMessage): Promise<void> {
    await this.redis.rpush('bot_queue_ads', JSON.stringify({ ...data }));
  }

  async sendNotificationToBot({
    ...data
  }: IBotNotificationMessage): Promise<void> {
    await this.redis.rpush(
      'bot_queue_notifications',
      JSON.stringify({ ...data }),
    );
  }

  async setCache(key: string, value: any, ttl: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async setCacheNotExists(key: string, value: any): Promise<string | null> {
    return await this.redis.set(key, JSON.stringify(value), 'NX');
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
