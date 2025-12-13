import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { tariffData } from 'constants/tariffs';
import { type ICallbackData, type IOrder } from 'config/types';
import { createPayment } from 'config/lib/helpers/createPayment';
import { editMessage } from 'config/lib/helpers/editMessage';

export async function handleChooseTariff(
  chatId: number,
  messageId: number | undefined,
  callbackData: ICallbackData,
  callbackQueryId: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(chatId));
  const orderId: number = callbackData.param;
  const order: IOrder | undefined = tariffData.find(
    (item) => item.orderId === orderId,
  );
  if (order) {
    const { quantityOfDays } = order;
    const data = JSON.stringify({
      userId: chatId,
      quantity: quantityOfDays,
      messageId,
      amount: order.amount,
    });
    const redirectUrl = await createPayment(order, data);
    if (redirectUrl) {
      await editMessage(
        chatId,
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
}
