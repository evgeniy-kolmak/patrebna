import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { editMessage } from 'config/lib/helpers/editMessage';
import i18next, { t } from 'i18next';

export async function handleSubscribeToChannel(
  chatId: number,
  messageId: number | undefined,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(chatId));
  await editMessage(chatId, messageId, t('Текст с задачей подписки на канал'), {
    inline_keyboard: [
      [
        {
          text: t('Проверить'),
          callback_data: JSON.stringify({
            action: 'check_on_subscribe_channel',
          }),
        },
      ],
      [
        {
          text: t('Назад'),
          callback_data: JSON.stringify({ action: 'get_free_premium' }),
        },
      ],
    ],
  });
}
