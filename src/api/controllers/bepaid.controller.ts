import db from 'config/db/databaseServise';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import {
  StatusTransaction,
  type ITrackingData,
  type ResponseTransaction,
  type ResponseOrder,
} from 'config/types';
import { type Request, type Response } from 'express';
import i18next, { t } from 'i18next';
import { TelegramService } from 'config/telegram/telegramServise';
import { submitReceipt } from 'config/lib/helpers/playwright/submitReceipt';

export async function bepaidHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    res.status(200).json({ status: 'ok' });
    switch (true) {
      case Boolean(req.body.transaction):
        await handleTransactionWebhook(req);
        break;

      case req.body.status === 'expired':
        await handleTokenExpiredWebhook(req);
        break;

      default:
        console.info('Неизвестный webhook:', req.body);
    }
  } catch (error) {
    console.error('Ошибка обработки запроса:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
}

async function handleTransactionWebhook(req: Request): Promise<void> {
  try {
    const { status, tracking_id, amount, description }: ResponseTransaction =
      req.body?.transaction;
    const {
      userId,
      quantity,
      messageId,
      status: premiumStatus,
    }: ITrackingData = JSON.parse(tracking_id);
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
        await TelegramService.editMessageText(userId, messageId, message);
        await TelegramService.sendMessageToChat(
          `✅ Пользователь с id: <b>${userId}</b> приобрел\n<b>«${description}»</b>.`,
        );
        try {
          await submitReceipt(userId, description, price.toString());
        } catch (error) {
          await TelegramService.sendMessageToChat(
            `❌ Ошибка выдачи чека для пользователя с id: <b>${userId}</b>`,
          );
          console.error('Ошибка при отправке чека:', error);
        }
      } else {
        const baseAmount = amount / 10;
        const bonusAmount = Math.ceil(baseAmount * 0.1);
        const totalAmount = baseAmount + bonusAmount;
        await db.incrementWallet(userId, totalAmount);
        const message = `${[
          `${t('Успешная подписка (title)')} <b>${price}</b> BYN.`,
          `${t('Успешное пополнение (subtitle)')} <b>${totalAmount}</b> ${t('Бонусов')}.`,
        ].join('\n')}`;
        await TelegramService.editMessageText(userId, messageId, message);
        await TelegramService.sendMessageToChat(
          `✅ Пользователь с id: <b>${userId}</b> пополнил кошелек на <b>${amount / 10}</b> бонусов.`,
        );
        try {
          await submitReceipt(userId, description, price.toString());
        } catch (error) {
          await TelegramService.sendMessageToChat(
            `❌ Ошибка выдачи чека для пользователя с id: <b>${userId}</b>`,
          );
          console.error('Ошибка при отправке чека:', error);
        }
      }
    } else {
      await TelegramService.editMessageText(
        userId,
        messageId,
        t('Сообщение о неудаче'),
      );
      if (quantity) {
        await TelegramService.sendMessageToChat(
          `❌ Пользователь с id: <b>${userId}</b> не смог приобрести премиум на <b>${quantity}</b> дней.`,
        );
      } else {
        await TelegramService.sendMessageToChat(
          `❌ Пользователь с id: <b>${userId}</b> не смог пополнить кошелек на <b>${amount / 10}</b> бонусов.`,
        );
      }
    }
  } catch (error) {
    console.error('Ошибка обработки вебхука:', error);
  }
}

async function handleTokenExpiredWebhook(req: Request): Promise<void> {
  try {
    const { tracking_id }: ResponseOrder = req.body?.order;
    const { userId, messageId }: ITrackingData = JSON.parse(tracking_id);
    await i18next.changeLanguage(await getUserLanguage(userId));

    await TelegramService.editMessageText(
      userId,
      messageId,
      t('Платежная ссылка не действительна'),
    );
  } catch (error) {
    console.error('Ошибка обработки вебхука:', error);
  }
}
