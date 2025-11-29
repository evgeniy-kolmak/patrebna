import i18next, { t } from 'i18next';
import { sendPhoto } from 'config/lib/helpers/sendPhoto';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { pause } from 'config/lib/helpers/pause';
import { isTelegramError, type IAd } from 'config/types';

interface SendMessageOfNewAdProps extends IAd {
  userId: number;
}

export async function sendMessageOfNewAd(
  ad: SendMessageOfNewAdProps,
): Promise<string | undefined> {
  const { userId, img_url, price, title, url, region } = ad;
  await i18next.changeLanguage(await getUserLanguage(userId));
  const caption = [
    `${t('Появилось')} <a href="${url}">${t('Новое объявление')}</a>:`,
    `<b>${title}</b>\u2060 , ${t('В локации')}  <b>${region}</b>, ${t('C ценой')} <b>${price}</b>.`,
  ]
    .filter(Boolean)
    .join('\n');

  const keyboardForMessage = {
    inline_keyboard: [
      [
        {
          text: t('Подробнее'),
          web_app: { url },
        },
      ],
    ],
  };

  try {
    await sendPhoto(userId, caption, keyboardForMessage, img_url);
  } catch (error) {
    if (isTelegramError(error)) {
      const { error_code, parameters } = error.response.body;

      if (error_code === 429) {
        const wait = (parameters?.retry_after ?? 1) * 1000;
        console.warn(`Слишком много запросов, ждем ${wait}ms`);
        await pause(wait);
        await sendMessageOfNewAd(ad);
        return;
      }
    }
    console.error('Неизвестная ошибка при отправке уведомлений:', error);
  }
}
