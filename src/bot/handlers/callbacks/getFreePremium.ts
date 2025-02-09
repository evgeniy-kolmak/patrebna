import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { bot } from 'bot';
import { editMessage } from 'config/lib/helpers/editMessage';

export async function handleGetFreePremium(
  chatId: number,
  messageId: number | undefined,
): Promise<void> {
  await i18next.changeLanguage(getUserLanguage(chatId));

  await editMessage(
    chatId,
    messageId,
    t('Сообщение для получение бесплатного премиума'),
    {
      inline_keyboard: [
        [
          {
            text: t('Назад'),
            callback_data: JSON.stringify({ action: 'back_premium' }),
          },
        ],
      ],
    },
  );
}
