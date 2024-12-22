import redis from 'redis';

class RedisService {
  private readonly client: redis.RedisClientType;

  constructor() {
    const password = process.env.REDIS_PASSWORD ?? '';

    // Создаем клиента Redis и сохраняем его в свойстве класса
    this.client = redis.createClient({
      url: 'rediss://redis:6379',
      password,
      socket: {
        tls: true,
        ca: './certs/ca.pem',
        cert: './certs/client-cert.pem',
        key: './certs/client-key.pem',
      },
    });

    this.client.on(
      'error',
      console.error.bind(console, 'Error connecting to Redis:'),
    );

    // Соединение с Redis
    this.client.once('connect', () => {
      console.log('Connected to Redis successfully!');
    });
  }

  async getCache(key: string): Promise<string | null> {
    return await this.client.get(key);
  }
}

const cache = new RedisService();
export default cache;
