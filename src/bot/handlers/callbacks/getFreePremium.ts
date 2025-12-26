import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { editMessage } from 'config/lib/helpers/editMessage';
import db from 'config/db/databaseServise';
import keyboards from 'bot/keyboards';
import { checkStatusOfDailyActivities } from 'config/lib/helpers/checkStatusOfDailyActivities';

export async function handleGetFreePremium(
  chatId: number,
  messageId: number | undefined,
  callbackQueryId: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(chatId));
  const isSubscribedToChannel = await db.isChannelSubscriptionRewarded(chatId);
  const isPlayGame = await checkStatusOfDailyActivities(`dailyGame:${chatId}`);

  await editMessage(
    chatId,
    messageId,
    t('Описание для списка задач бесплатного премиума'),
    callbackQueryId,
    keyboards.FreePremium(isSubscribedToChannel, isPlayGame),
  );
}
