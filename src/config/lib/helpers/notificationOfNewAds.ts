import db from 'config/db/databaseServise';
import cache from 'config/redis/redisService';
import { type IAd, type IErrorTelegram, type IParserData } from 'config/types';
import { pause } from 'config/lib/helpers/pause';
import { sendMessageOfNewAd } from 'config/lib/helpers/sendMessageOfNewAd';

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
    try {
      await pause(200);
      await sendMessageOfNewAd({ userId: user?.userId, ...ad });
    } catch (error) {
      const err = error as IErrorTelegram;
      const { error_code } = err.response.body;
      if (error_code === 403) {
        await db.removeUser(user?.userId);
        console.error('Заблокированный пользователь был удален!');
        return;
      } else {
        console.log('Ошибка при отправке уведомления:', error);
      }
    }
  }
}
