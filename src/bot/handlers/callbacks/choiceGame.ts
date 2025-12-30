import { bot } from 'bot';
import db from 'config/db/databaseServise';
import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { checkStatusOfDailyActivities } from 'config/lib/helpers/checkStatusOfDailyActivities';
import { editMessage } from 'config/lib/helpers/editMessage';
import keyboards from 'bot/keyboards';
import { getSecondsUntilEndOfDay } from 'config/lib/helpers/getSecondsUntilEndOfDay';
import cache from 'config/redis/redisService';
import { pause } from 'config/lib/helpers/pause';
import { sendMessage } from 'config/lib/helpers/sendMessage';

export async function handleChoiceGame(
  userId: number,
  messageId: number | undefined,
  callbackQueryId: string,
  callbackData: { param?: number },
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(userId));
  const key = `dailyGame:${userId}`;
  const isCompleted = await checkStatusOfDailyActivities(key);
  if (isCompleted) {
    await editMessage(
      userId,
      messageId,
      t('Игра уже сыграна'),
      callbackQueryId,
    );
    return;
  }
  const message = await bot.sendDice(userId, { emoji: '🎲' });
  const isSubscribedToChannel = await db.isChannelSubscriptionRewarded(userId);
  await editMessage(
    userId,
    messageId,
    t('Описание для списка задач бесплатного премиума'),
    callbackQueryId,
    keyboards.FreePremium(isSubscribedToChannel, true),
  );
  const ttlSec = getSecondsUntilEndOfDay();
  await cache.setCache(key, true, ttlSec);
  await pause(3000);
  if (callbackData?.param === message?.dice?.value) {
    await db.grantPremium(userId, 1);
    await sendMessage(userId, t('Выигрыш'));
  } else {
    await sendMessage(userId, t('Проигрыш'));
  }
}
