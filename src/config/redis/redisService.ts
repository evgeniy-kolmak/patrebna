import Redis from 'ioredis';

class RedisService {
  private readonly redis: Redis;
  constructor() {
    const password = process.env.REDIS_PASSWORD ?? '';
    this.redis = new Redis({
      host: 'redis',
      port: 6379,
      tls: {
        ca: './certs/ca.pem',
        cert: './certs/redis-client-cert.pem',
        key: './certs/redis-client-key.pem',
      },
      password,
    });

    this.redis.on(
      'error',
      console.error.bind(console, 'Error connecting to Redis:'),
    );

    this.redis.once('open', () => {
      console.log('Connected to Redis successfully!');
    });
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
