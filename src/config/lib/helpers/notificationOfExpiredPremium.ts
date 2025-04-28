import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { sendMessage } from 'config/lib/helpers/sendMessage';

export async function notificationOfExpiredPremium(
  userId: number,
  message: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(userId));
  await sendMessage(userId, message, {
    inline_keyboard: [
      [
        {
          text: t('Купить подписку'),
          callback_data: JSON.stringify({ action: 'buy_premium' }),
        },
      ],
    ],
  });
}
