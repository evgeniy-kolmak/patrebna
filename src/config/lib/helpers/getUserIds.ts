import db from 'config/db/databaseServise';
import cache from 'config/redis/redisService';
import { hasPremium } from 'config/lib/helpers/hasPremium';

export async function getUserIds(): Promise<number[]> {
  const userIds = await cache.getCache('ids');
  if (userIds && userIds !== '[]') return JSON.parse(userIds);

  const usersFromDatabase = await db.getUsersForParse();
  const usersWithPremium = await Promise.all(
    usersFromDatabase
      .filter(({ parser }) => parser?.kufar?.dataParser)
      .map(async ({ id }) => {
        const has = await hasPremium(id);
        return has ? id : null;
      }),
  );
  const userIdsFromDatabase = usersWithPremium.filter(
    (id): id is number => id !== null,
  );
  await cache.setCache('ids', userIdsFromDatabase, 43200);
  return userIdsFromDatabase;
}
