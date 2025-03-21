import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { bot } from 'bot';

export async function notificationOfExpiredPremium(
  userId: number,
  message: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(userId));
  await bot.sendMessage(userId, message, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: t('Купить подписку'),
            callback_data: JSON.stringify({ action: 'buy_premium' }),
          },
        ],
      ],
    },
  });
}
