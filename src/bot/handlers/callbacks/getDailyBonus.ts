import i18next, { t } from 'i18next';
import db from 'config/db/databaseServise';
import cache from 'config/redis/redisService';
import { editMessage } from 'config/lib/helpers/editMessage';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { checkStatusOfDailyBonus } from 'config/lib/helpers/checkStatusOfDailyBonus';

export async function getDailyBonus(
  chatId: number,
  messageId: number | undefined,
  callbackQueryId: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(chatId));
  const key = `dailyBonus:${chatId}`;
  const isCompleted = await checkStatusOfDailyBonus(chatId);
  if (isCompleted) {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const ttlMs = end.getTime() - now.getTime();
    const ttlSec = Math.ceil(ttlMs / 1000);
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
