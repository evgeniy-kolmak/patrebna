import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { editMessage } from 'config/lib/helpers/editMessage';
import { checkStatusOfDailyActivities } from 'config/lib/helpers/checkStatusOfDailyActivities';
import keyboards from 'bot/keyboards';

export async function handlePlayGame(
  userId: number,
  messageId: number | undefined,
  callbackQueryId: string,
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

  await editMessage(
    userId,
    messageId,
    t('Правила игры'),
    callbackQueryId,
    keyboards.Game(),
  );
}
