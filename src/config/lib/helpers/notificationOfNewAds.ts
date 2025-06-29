import cache from 'config/redis/redisService';
import { isTelegramError, type IAd, type IParserData } from 'config/types';
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
    try {
      await pause(1000);
      await sendMessageOfNewAd({ userId: user?.userId, ...ad });
    } catch (error) {
      if (isTelegramError(error)) {
        const { error_code } = error.response.body;
        if (error_code === 403) {
          await db.removeUser(user?.userId);
          console.error('Заблокированный пользователь был удален!');
          return;
        } else {
          console.error('Ошибка при отправке уведомления:', error);
        }
      }
    }
  }
}
