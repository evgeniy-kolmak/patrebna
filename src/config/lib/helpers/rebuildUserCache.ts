import db from 'config/db/databaseServise';
import cache from 'config/redis/redisService';

export async function rebuildUserCache(
  userId: number,
  TTL: number,
): Promise<void> {
  const user = await db.getUserForParse(userId);
  await cache.setCache(`user:${userId}`, user, TTL);
}
