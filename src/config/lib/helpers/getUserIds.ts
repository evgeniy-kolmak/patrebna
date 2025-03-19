import db from 'config/db/databaseServise';
import cache from 'config/redis/redisService';

export async function getUserIds(): Promise<number[]> {
  const userIds = await cache.getCache('userIds');
  if (userIds) return JSON.parse(userIds);

  const userIdsFromDatabase = await db.getUserIdsForParse();
  await cache.setCache('ids', userIdsFromDatabase, 43200);
  return userIdsFromDatabase;
}
