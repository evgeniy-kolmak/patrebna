import db from 'config/db/databaseServise';
import cache from 'config/redis/redisService';
import { type IParserData } from 'config/types';

export async function getUser(userId: number): Promise<IParserData> {
  const userDataFromCache = await cache.getCache(`user:${userId}`);
  if (userDataFromCache) return JSON.parse(userDataFromCache);
  return await db.getUserForParse(userId);
}
