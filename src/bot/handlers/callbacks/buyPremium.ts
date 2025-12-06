import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { editMessage } from 'config/lib/helpers/editMessage';
import { tariffData } from 'constants/tariffs';
import i18next, { t } from 'i18next';

export async function handleBuyPremium(
  chatId: number,
  messageId: number | undefined,
  callbackQueryId: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(chatId));
  await editMessage(
    chatId,
    messageId,
    t('Сообщение над тарифами'),
    callbackQueryId,
    {
      inline_keyboard: [
        ...tariffData.map((tariff, index) => [
          {
            text: `${t(tariff.name)} — ${tariff.quantityOfDays} ${t('Дней')} (🎄 -26%)`,
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
  );
}
