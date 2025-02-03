import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { tariffData } from 'constants/tariffs';
import { type ICallbackData, type IOrder } from 'config/types';
import { bot } from 'bot';
import { createPayment } from 'config/lib/helpers/createPayment';

export async function handleChooseTariff(
  chatId: number,
  messageId: number | undefined,
  callbackData: ICallbackData,
): Promise<void> {
  await i18next.changeLanguage(getUserLanguage(chatId));
  const orderId: number = callbackData.param;
  const order: IOrder | undefined = tariffData.find(
    (item) => item.orderId === orderId,
  );
  if (order) {
    const { qauntityOfDays } = order;
    const data = JSON.stringify({
      userId: chatId,
      qauntity: qauntityOfDays,
    });
    const redirectUrl = await createPayment(order, data);
    if (redirectUrl) {
      await bot.editMessageText(t(order.messageForBot), {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: {
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
      });
    }
  }
}
