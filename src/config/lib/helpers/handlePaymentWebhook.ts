import db from 'config/db/databaseServise';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import {
  StatusTransaction,
  type ITrackingData,
  type ResponseTransaction,
  type ResponseOrder,
  type PaymentWebhookBody,
} from 'config/types';
import i18next, { t } from 'i18next';
import { submitReceipt } from 'config/lib/helpers/playwright/submitReceipt';
import { editMessage } from 'config/lib/helpers/editMessage';
import { sendMessage } from 'config/lib/helpers/sendMessage';

const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID ?? '';

export async function handlePaymentWebhook(
  body: PaymentWebhookBody,
): Promise<void> {
  if (body?.transaction) {
    await handleTransactionWebhook(body.transaction);
    return;
  }

  if (body?.status === 'expired') {
    await handleTokenExpiredWebhook(body.order);
    return;
  }

  console.info('Неизвестный webhook:', body);
}

async function handleTransactionWebhook(
  transaction: ResponseTransaction,
): Promise<void> {
  try {
    const { status, tracking_id, amount, description }: ResponseTransaction =
      transaction;
    let parsed: ITrackingData;

    try {
      parsed = JSON.parse(tracking_id);
    } catch {
      console.error('Невалидный tracking_id:', tracking_id);
      return;
    }

    const { userId, quantity, messageId, status: premiumStatus } = parsed;
    const price = amount / 100;
    await i18next.changeLanguage(await getUserLanguage(userId));
    if (status === StatusTransaction.SUCCESSFUL) {
      if (quantity) {
        const endDate = await db.grantPremium(userId, quantity, premiumStatus);
        await db.incrementWallet(userId, price);
        const message = `${[
          `${t('Успешная подписка (title)')} <b>${price}</b> BYN.`,
          `${t('Успешная подписка (subtitle)')} <b>${endDate.toLocaleDateString('ru-RU')}.</b>`,
        ].join('\n')}`;
        await editMessage(userId, messageId, message);
        await sendMessage(
          Number(CHANNEL_ID),
          `✅ Пользователь с id: <b>${userId}</b> приобрел\n<b>«${description}»</b>.`,
        );
        await safeSendReceipt(userId, description, price.toString());
      } else {
        const baseAmount = amount / 10;
        const bonusAmount = Math.ceil(baseAmount * 0.1);
        const totalAmount = baseAmount + bonusAmount;
        await db.incrementWallet(userId, totalAmount);
        const message = `${[
          `${t('Успешная подписка (title)')} <b>${price}</b> BYN.`,
          `${t('Успешное пополнение (subtitle)')} <b>${totalAmount}</b> ${t('Бонусов')}.`,
        ].join('\n')}`;
        await editMessage(userId, messageId, message);
        await sendMessage(
          Number(CHANNEL_ID),
          `✅ Пользователь с id: <b>${userId}</b> пополнил кошелек на <b>${amount / 10}</b> бонусов.`,
        );
        await safeSendReceipt(userId, description, price.toString());
      }
    } else {
      await editMessage(userId, messageId, t('Сообщение о неудаче'));
      if (quantity) {
        await sendMessage(
          Number(CHANNEL_ID),
          `❌ Пользователь с id: <b>${userId}</b> не смог приобрести премиум на <b>${quantity}</b> дней.`,
        );
      } else {
        await sendMessage(
          Number(CHANNEL_ID),
          `❌ Пользователь с id: <b>${userId}</b> не смог пополнить кошелек на <b>${amount / 10}</b> бонусов.`,
        );
      }
    }
  } catch (error) {
    console.error('Ошибка обработки вебхука:', error);
  }
}

async function handleTokenExpiredWebhook(order: ResponseOrder): Promise<void> {
  try {
    const { tracking_id }: ResponseOrder = order;
    const { userId, messageId }: ITrackingData = JSON.parse(tracking_id);
    await i18next.changeLanguage(await getUserLanguage(userId));

    await editMessage(
      userId,
      messageId,
      t('Платежная ссылка не действительна'),
    );
  } catch (error) {
    console.error('Ошибка обработки вебхука:', error);
  }
}

async function safeSendReceipt(
  userId: number,
  description: string,
  price: string,
): Promise<void> {
  try {
    await submitReceipt(userId, description, price);
  } catch (error) {
    await sendMessage(
      Number(CHANNEL_ID),
      `❌ Ошибка выдачи чека для пользователя с id: <b>${userId}</b>`,
    );
    console.error(error);
  }
}
