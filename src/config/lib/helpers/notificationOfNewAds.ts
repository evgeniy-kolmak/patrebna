import db from 'config/db/databaseServise';
import cache from 'config/redis/redisService';
import { type IAd, type IErrorTelegram, type IParserData } from 'config/types';
import { pause } from 'config/lib/helpers/pause';
import { sendMessageOfNewAd } from 'config/lib/helpers/sendMessageOfNewAd';

export async function notificationOfNewAds(
  userId: number,
  newAds: IAd[],
  user: IParserData,
): Promise<void> {
  if (!user.canNotify) {
    await cache.setCache(`user:${userId}`, { ...user, canNotify: true }, 43200);
  }
  for (const ad of newAds) {
    try {
      await pause(200);
      await sendMessageOfNewAd({ userId, ...ad });
    } catch (error) {
      const err = error as IErrorTelegram;
      const { error_code } = err.response.body;
      if (error_code === 403) {
        await db.removeUser(userId);
        console.error('Заблокированный пользователь был удален!');
        return;
      } else {
        console.log('Ошибка при отправке уведомления:', error);
      }
    }
  }
}
