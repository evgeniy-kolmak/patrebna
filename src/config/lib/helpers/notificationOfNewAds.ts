import cache from 'config/redis/redisService';
import { type IAd, type IParserData } from 'config/types';
import { pause } from 'config/lib/helpers/pause';
import { sendMessageOfNewAd } from 'config/lib/helpers/sendMessageOfNewAd';
import db from 'config/db/databaseServise';

export async function notificationOfNewAds(
  user: IParserData & {
    userId: number;
  },
  newAds: IAd[],
): Promise<void> {
  if (!user.canNotify) {
    await cache.setCache(
      `user:${user?.userId}`,
      { ...user, canNotify: true },
      43200,
    );
  }
  for (const ad of newAds) {
    await pause(1000);
    const stateOfUser = await sendMessageOfNewAd({
      userId: user?.userId,
      ...ad,
    });
    if (stateOfUser === 'User is blocked') {
      await db.removeUser(user?.userId);
      return;
    }
  }
}
