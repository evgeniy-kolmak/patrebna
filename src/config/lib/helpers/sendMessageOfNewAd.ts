import { bot } from 'bot';
import { isTelegramError, type IAd } from 'config/types';
import { truncateString } from 'config/lib/helpers/truncateString';
import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { type SendPhotoOptions } from 'node-telegram-bot-api';
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
  const caption = [
    `${t('Появилось')} <a href="${url}">${t('Новое объявление')}</a>: <b>${title}</b>`,
    `${t('C ценой')} <b>${price}</b>.`,
    description ? `<i>${truncateString(description, 500)}\n</i>` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const messageOptions: SendPhotoOptions = {
    caption,
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
  };

  const defaultImage = 'https://i.ibb.co/NLkvZYG/no-photo.webp';
  try {
    await bot.sendPhoto(userId, img_url, messageOptions);
  } catch (error) {
    if (isTelegramError(error)) {
      const { description } = error.response.body;
      if (
        description.includes('Bad Request: wrong type of the web page content')
      ) {
        await bot.sendPhoto(userId, defaultImage, messageOptions);
        console.error('Невалидная ссылка изображения!');
        return;
      }
      console.error('Ошибка при отправке уведомления:', error);
    }
  }
}
