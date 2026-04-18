import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { tariffData } from 'constants/tariffs';
import {
  type ITrackingData,
  type ICallbackData,
  type IOrder,
} from 'config/types';
import { createPayment } from 'config/lib/helpers/createPayment';
import { editMessage } from 'config/lib/helpers/editMessage';
import { safeAnswerCallbackQuery } from 'config/lib/helpers/safeAnswerCallbackQuery';

export async function handleChooseTariff(
  userId: number,
  messageId: number,
  callbackData: ICallbackData,
  callbackQueryId: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(userId));
  const orderId: number = callbackData.param;
  const order: IOrder | undefined = tariffData.find(
    (item) => item.orderId === orderId,
  );
  if (order) {
    const { quantityOfDays, status } = order;
    const trackingData: ITrackingData = {
      userId,
      quantity: quantityOfDays,
      messageId,
      status,
    };
    const redirectUrl = await createPayment(
      order,
      JSON.stringify(trackingData),
    );
    if (!redirectUrl) {
      await safeAnswerCallbackQuery(callbackQueryId, {
        text: t('Неизвестная ошибка'),
        show_alert: true,
      });
      return;
    }
    await editMessage(
      userId,
      messageId,
      t(order.messageForBot),
      callbackQueryId,
      {
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
      },
    );
  }
}
