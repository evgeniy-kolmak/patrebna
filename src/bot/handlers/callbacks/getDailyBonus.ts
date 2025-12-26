import i18next, { t } from 'i18next';
import db from 'config/db/databaseServise';
import cache from 'config/redis/redisService';
import { editMessage } from 'config/lib/helpers/editMessage';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { checkStatusOfDailyActivities } from 'config/lib/helpers/checkStatusOfDailyActivities';
import { getSecondsUntilEndOfDay } from 'config/lib/helpers/getSecondsUntilEndOfDay';

export async function getDailyBonus(
  chatId: number,
  messageId: number | undefined,
  callbackQueryId: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(chatId));
  const key = `dailyBonus:${chatId}`;
  const isCompleted = await checkStatusOfDailyActivities(key);
  if (!isCompleted) {
    const ttlSec = getSecondsUntilEndOfDay();
    await cache.setCache(key, true, ttlSec);
    const dailyBonus = Math.floor(Math.random() * 11) / 10;
    await db.incrementWallet(chatId, dailyBonus);
    await editMessage(
      chatId,
      messageId,
      `${t('Успех получения бонусов')} <b>${dailyBonus}</b>`,
      callbackQueryId,
    );
  } else {
    await editMessage(
      chatId,
      messageId,
      t('Бонус уже получен'),
      callbackQueryId,
    );
  }
}
