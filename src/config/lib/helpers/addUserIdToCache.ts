import cache from 'config/redis/redisService';

export async function addUserIdToCache(userId: number): Promise<void> {
  const cacheUsers = await cache.getCache('ids');
  const ttl = await cache.getTTL('ids');
  if (!cacheUsers || ttl === -2) return;

  let ids: number[] = JSON.parse(cacheUsers);
  if (!ids.includes(userId)) {
    ids = [userId, ...ids];
    await cache.setCache('ids', ids, ttl);
  }
}
