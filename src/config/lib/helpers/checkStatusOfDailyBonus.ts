import cache from 'config/redis/redisService';

export async function checkStatusOfDailyBonus(
  userId: number,
): Promise<boolean> {
  const key = `dailyBonus:${userId}`;
  const isCompleted = await cache.getCache(key);
  return Boolean(isCompleted);
}
