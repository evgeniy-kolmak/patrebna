import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import cache from 'config/redis/redisService';

export async function notificationOfExpiredPremium(
  userId: number,
  text: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(userId));
  await cache.sendNotificationToBot({
    userId,
    text,
    keyboard: {
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
