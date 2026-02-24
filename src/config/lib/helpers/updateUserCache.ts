import cache from 'config/redis/redisService';
import {
  OperationType,
  type UpdateUserCacheAction,
  type IParserData,
} from 'config/types';
import { rebuildUserCache } from 'config/lib/helpers/rebuildUserCache';
import { addUserIdToCache } from 'config/lib/helpers/addUserIdToCache';
import { removeUserIdFromCache } from 'config/lib/helpers/removeUserIdFromCache';

export async function updateUserCache(
  userId: number,
  action: UpdateUserCacheAction,
): Promise<void> {
  const TTL = 43200;
  const KEY = `user:${userId}`;
  const currentTTL = await cache.getTTL(KEY);
  const cacheUser = await cache.getCache(KEY);
  const { type } = action;
  switch (type) {
    case OperationType.INSERT: {
      await addUserIdToCache(userId);

      if (!cacheUser || currentTTL === -2) {
        await rebuildUserCache(userId, TTL);
        return;
      }

      const parserData: IParserData = JSON.parse(cacheUser);
      parserData.urls ??= [];
      parserData.urls.push(action.url);
      await cache.setCache(KEY, parserData, currentTTL);
      break;
    }

    case OperationType.UPDATE: {
      await addUserIdToCache(userId);

      if (!cacheUser || currentTTL === -2) {
        await rebuildUserCache(userId, TTL);
        return;
      }

      const parserData: IParserData = JSON.parse(cacheUser);

      if (!Array.isArray(parserData.urls)) {
        await rebuildUserCache(userId, TTL);
        return;
      }

      const index = parserData.urls.findIndex(
        (u) => u.urlId === action.url.urlId,
      );

      if (index === -1) {
        await rebuildUserCache(userId, TTL);
        return;
      }

      parserData.urls[index] = action.url;

      await cache.setCache(KEY, parserData, currentTTL);
      break;
    }
    case OperationType.REPLACE_ALL: {
      await addUserIdToCache(userId);

      if (!cacheUser || currentTTL === -2) {
        await rebuildUserCache(userId, TTL);
        return;
      }

      const parserData: IParserData = JSON.parse(cacheUser);

      parserData.urls = action.urls;

      await cache.setCache(KEY, parserData, currentTTL);
      break;
    }
    case OperationType.DELETE: {
      await removeUserIdFromCache(userId);
      await cache.removeCache(KEY);
      break;
    }
  }
}
