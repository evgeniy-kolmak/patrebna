import db from 'config/db/databaseServise';
import { createPayment } from 'config/lib/helpers/createPayment';
import { type ITrackingData, StatusPremium } from 'config/types';
import { type InlineKeyboardMarkup } from 'node-telegram-bot-api';
import { TelegramService } from 'config/telegram/telegramServise';
import { pause } from 'config/lib/helpers/pause';

export async function notifyInactiveUsers(): Promise<void> {
  const currentDay = new Date();
  const oldUserIds = await db.getOldUserIds();
  if (!oldUserIds.length) return;
  for (const userId of oldUserIds) {
    await pause();
    const premium = await db.getDataPremium(userId);
    const endDay = premium?.end_date ?? premium?.updatedAt ?? currentDay;
    const daysSinceEnd = Math.floor(
      (currentDay.getTime() - new Date(endDay).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const text = [
      '👀 <b>Мы скучали!</b>',
      '',
      `Вас не было <b>${daysSinceEnd} дней</b>.`,
      `За это время вы пропустили <b>${daysSinceEnd * 15} новых объявлений</b> на Куфаре.`,
      '',
      '🔥 <b>Самое время вернуться!</b>',
      '<b>60 дней Базовой подписки за 4.99 BYN</b> — 2 месяца по цене одного.',
      '',
      '🚀 <b>Возвращайтесь и ловите лучшие предложения первыми!</b>',
    ].join('\n');
    const response = await TelegramService.sendMessage(userId.toString(), text);
    if (!response) return;
    const messageId = response.result.message_id;

    const trakingData: ITrackingData = {
      userId,
      messageId,
      status: StatusPremium.BASE,
      quantity: 60,
    };

    const redirectUrl = await createPayment(
      { description: 'Специальное предложение', amount: 499 },
      JSON.stringify(trakingData),
    );
    if (!redirectUrl) return;

    const keyboard: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          {
            text: '⚡ Забрать',
            web_app: {
              url: redirectUrl,
            },
          },
        ],
      ],
    };
    await TelegramService.editMessageReplyMarkup(
      userId.toString(),
      messageId,
      keyboard,
    );
  }
}
