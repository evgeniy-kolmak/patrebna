import db from 'config/db/databaseServise';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import {
  StatusTransaction,
  type ITrackingData,
  type ResponseTransaction,
  type ResponseOrder,
} from 'config/types';
import { type Request, type Response } from 'express';
import i18next, { t } from 'i18next';
import { TelegramService } from 'config/telegram/telegramServise';

export async function bepaidWebhookHandler(
  req: Request,
  res: Response,
): Promise<void> {
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

  res.status(200).json({ status: 'ok' });
}

async function handleTransactionWebhook(req: Request): Promise<void> {
  try {
    const { status, tracking_id }: ResponseTransaction = req.body?.transaction;
    const { userId, quantity, messageId }: ITrackingData =
      JSON.parse(tracking_id);
    await i18next.changeLanguage(await getUserLanguage(userId));
    if (status === StatusTransaction.SUCCESSFUL) {
      await db.grantPremium(userId, quantity);
      await TelegramService.editMessageText(
        userId,
        messageId,
        t('Сообщение об успехе'),
      );
      await TelegramService.sendMessageToChat(
        `✅ Пользователь с id: <b>${userId}</b> приобрел премиум на <b>${quantity}</b> дней.`,
      );
    } else {
      await TelegramService.editMessageText(
        userId,
        messageId,
        t('Сообщение о неудаче'),
      );
      await TelegramService.sendMessageToChat(
        `❌ Пользователь с id: <b>${userId}</b> не смог приобрести премиум на <b>${quantity}</b> дней.`,
      );
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
