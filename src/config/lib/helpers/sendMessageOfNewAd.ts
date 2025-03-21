import { bot } from 'bot';
import { type IAd } from 'config/types';
import { truncateString } from 'config/lib/helpers/truncateString';
import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';

interface SendMessageOfNewAdProps extends IAd {
  userId: number;
}

export async function sendMessageOfNewAd({
  userId,
  img_url,
  price,
  title,
  url,
  description,
}: SendMessageOfNewAdProps): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(userId));
  const message = [
    `${t('Появилось')} <a href="${url}">${t('Новое объявление')}</a>: <b>${title}</b>`,
    `${t('C ценой')} <b>${price}</b>.`,
    description ? `<i>${truncateString(description, 500)}\n</i>` : '',
  ]
    .filter(Boolean)
    .join('\n');
  try {
    await bot.sendPhoto(userId, `${img_url}`, {
      caption: message,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: t('Подробнее'),
              web_app: { url },
            },
          ],
        ],
      },
    });
  } catch {
    await bot.sendPhoto(userId, 'https://i.ibb.co/NLkvZYG/no-photo.webp', {
      caption: message,
      parse_mode: 'HTML',
    });
    console.error('Невалидная ссылка изображения!');
  }
}
