import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { createPayment } from 'config/lib/helpers/createPayment';
import { editMessage } from 'config/lib/helpers/editMessage';
import { safeAnswerCallbackQuery } from 'config/lib/helpers/safeAnswerCallbackQuery';
import { type ITrackingData } from 'config/types';
import { baseTariff } from 'constants/baseTariff';
import i18next, { t } from 'i18next';

export async function handleBuyBasePremium(
  userId: number,
  messageId: number,
  callbackQueryId: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(userId));
  const { quantityOfDays, status, messageForBot } = baseTariff;
  const trackingData: ITrackingData = {
    userId,
    quantity: quantityOfDays,
    messageId,
    status,
  };
  const redirectUrl = await createPayment(
    baseTariff,
    JSON.stringify(trackingData),
  );
  if (!redirectUrl) {
    await safeAnswerCallbackQuery(callbackQueryId, {
      text: t('Неизвестная ошибка'),
      show_alert: true,
    });
    return;
  }
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: t('Оплатить'),
          web_app: {
            url: redirectUrl,
          },
        },
      ],
      [
        {
          text: t('Назад'),
          callback_data: JSON.stringify({ action: 'buy_premium' }),
        },
      ],
    ],
  };

  await editMessage(
    userId,
    messageId,
    `${t(messageForBot)}\n\n👍 ${t('Всего')} за <b>5 BYN</b> ${t('Подпись к базовой подписке')}`,
    callbackQueryId,
    keyboard,
  );
}
