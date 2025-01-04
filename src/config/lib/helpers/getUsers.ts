import db from 'config/db/databaseServise';
import cache from 'config/redis/redisService';
import { type UsersParserData } from 'config/types';

export async function getUsers(): Promise<UsersParserData> {
  const usersFromCache = await cache.getCache('users');
  if (usersFromCache) return JSON.parse(usersFromCache);

  const userFromDatabase = await db.getUsersForParse();
  await cache.setCache('users', { ...userFromDatabase }, 43200);
  return userFromDatabase;
}
