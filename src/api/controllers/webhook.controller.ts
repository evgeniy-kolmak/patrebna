import db from 'config/db/databaseServise';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import {
  StatusTransaction,
  type TrackingData,
  type Transaction,
} from 'config/types';
import { type Request, type Response } from 'express';
import i18next, { t } from 'i18next';
import { TelegramService } from 'services/telegram.service';

export async function bepaidWebhookHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { status, tracking_id }: Transaction = req.body.transaction;
    const { userId, quantity, messageId }: TrackingData =
      JSON.parse(tracking_id);
    await i18next.changeLanguage(await getUserLanguage(userId));
    if (status === StatusTransaction.SUCCESSFUL) {
      await db.grantPremium(userId, quantity);
      await TelegramService.editMessageText(
        userId,
        messageId,
        t('Сообщение об успехе'),
      );
    } else {
      await TelegramService.editMessageText(
        userId,
        messageId,
        t('Сообщение о неудаче'),
      );
    }
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Ошибка обработки вебхука:', error);
  }
}
