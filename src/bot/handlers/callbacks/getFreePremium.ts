import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { editMessage } from 'config/lib/helpers/editMessage';
import db from 'config/db/databaseServise';

export async function handleGetFreePremium(
  chatId: number,
  messageId: number | undefined,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(chatId));
  const isSubscribedToChannel = await db.isChannelSubscriptionRewarded(chatId);

  const text = isSubscribedToChannel
    ? t('Сообщение для получение бесплатного премиума')
    : t('Описание для списка задач бесплатного премиума');

  const inline_keyboard = [
    ...(isSubscribedToChannel
      ? []
      : [
          [
            {
              text: t('Подписка на канал'),
              callback_data: JSON.stringify({ action: 'subscribe_channel' }),
            },
          ],
        ]),
    [
      {
        text: t('Назад'),
        callback_data: JSON.stringify({ action: 'back_premium' }),
      },
    ],
  ];

  await editMessage(chatId, messageId, text, { inline_keyboard });
}
