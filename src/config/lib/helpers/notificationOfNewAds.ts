import db from 'config/db/databaseServise';
import cache from 'config/redis/redisService';
import {
  type IAd,
  type UsersParserData,
  type IErrorTelegram,
} from 'config/types';
import { pause } from 'config/lib/helpers/pause';
import { sendMessageOfNewAd } from 'config/lib/helpers/sendMessageOfNewAd';

export async function notificationOfNewAds(
  userId: number,
  newAds: IAd[],
  users: UsersParserData,
): Promise<void> {
  if (!users[userId].canNotify) {
    users[userId].canNotify = true;
    await cache.setCache('users', { ...users }, 43200);
  }
  for (const ad of newAds) {
    try {
      await pause();
      await sendMessageOfNewAd({ userId, ...ad });
    } catch (error) {
      const err = error as IErrorTelegram;
      const { description, error_code } = err.response.body;
      if (
        description === 'Forbidden: bot was blocked by the user' &&
        error_code === 403
      ) {
        await db.removeUser(userId);
        console.error('Заблокированный пользователь был удален!');
        return;
      } else {
        console.log('Ошибка при отправке уведомления:', error);
      }
    }
  }
}
