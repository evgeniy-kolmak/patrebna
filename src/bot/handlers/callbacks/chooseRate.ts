import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { type ICallbackData, type IOrder } from 'config/types';
import { createPayment } from 'config/lib/helpers/createPayment';
import { editMessage } from 'config/lib/helpers/editMessage';
import { ratesData } from 'constants/rates';

export async function handleChooseRate(
  userId: number,
  messageId: number | undefined,
  callbackData: ICallbackData,
  callbackQueryId: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(userId));
  const orderId: number = callbackData.param;
  const order: Omit<IOrder, 'quantityOfDays'> | undefined = ratesData.find(
    (item) => item.orderId === orderId,
  );
  if (order) {
    const data = JSON.stringify({
      userId,
      messageId,
    });
    const redirectUrl = await createPayment(order, data);
    if (redirectUrl) {
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
                callback_data: JSON.stringify({ action: 'wallet_top_up' }),
              },
            ],
          ],
        },
      );
    }
  }
}
