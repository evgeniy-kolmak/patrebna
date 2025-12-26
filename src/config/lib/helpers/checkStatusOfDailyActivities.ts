import cache from 'config/redis/redisService';

export async function checkStatusOfDailyActivities(
  key: string,
): Promise<boolean> {
  const isCompleted = await cache.getCache(key);
  return Boolean(isCompleted);
}
