import cache from 'config/redis/redisService';

export async function removeUserIdFromCache(userId: number): Promise<void> {
  const cacheUsers = await cache.getCache('ids');
  const ttl = await cache.getTTL('ids');
  if (!cacheUsers || ttl === -2) return;
  let ids: number[] = JSON.parse(cacheUsers);
  ids = ids.filter((id) => id !== userId);
  await cache.setCache('ids', ids, ttl);
}
