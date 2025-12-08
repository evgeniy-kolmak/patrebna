import cache from 'config/redis/redisService';

const redis = cache.getClient();

void (async (): Promise<void> => {
  while (true) {
    try {
      const result = await redis.blpop(
        ['bot_queue_ads', 'bot_queue_extended_ads', 'bot_queue_notifications'],
        0,
      );
      if (!result) continue;
      process.send?.(result);
    } catch (error) {
      console.error('Ошибка слушителя', error);
    }
  }
})();
