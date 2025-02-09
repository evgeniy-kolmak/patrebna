import { bot } from 'bot';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { tariffData } from 'constants/tariffs';
import i18next, { t } from 'i18next';

export async function handleBuyPremium(
  chatId: number,
  messageId: number | undefined,
): Promise<void> {
  await i18next.changeLanguage(getUserLanguage(chatId));
  await bot.editMessageText(t('Сообщение над тарифами'), {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        ...tariffData.map((tariff, index) => [
          {
            text: `${t(tariff.name)} — ${tariff.qauntityOfDays} ${t('дней')}`,
            callback_data: JSON.stringify({
              action: 'choose_tariff',
              param: index + 1,
            }),
          },
        ]),
        [
          {
            text: t('Назад'),
            callback_data: JSON.stringify({ action: 'back_premium' }),
          },
        ],
      ],
    },
  });
}
