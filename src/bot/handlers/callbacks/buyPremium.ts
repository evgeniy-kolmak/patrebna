import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { editMessage } from 'config/lib/helpers/editMessage';
import { tariffData } from 'constants/tariffs';
import i18next, { t } from 'i18next';

export async function handleBuyPremium(
  userId: number,
  messageId: number | undefined,
  callbackQueryId: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(userId));
  await editMessage(
    userId,
    messageId,
    t('Сообщение над тарифами'),
    callbackQueryId,
    {
      inline_keyboard: [
        ...tariffData.map(({ name, orderId, quantityOfDays }) => [
          {
            text: `${t(name)} — ${quantityOfDays} ${t('Дней')} (🎄 -26%)`,
            callback_data: JSON.stringify({
              action: 'choose_tariff',
              param: orderId,
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
