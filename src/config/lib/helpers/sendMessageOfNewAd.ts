import { bot } from 'bot';
import db from 'config/db/databaseServise';
import { isTelegramError, type IAd } from 'config/types';
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

  region,
}: SendMessageOfNewAdProps): Promise<string | undefined> {
  await i18next.changeLanguage(await getUserLanguage(userId));
  const defaultImage = process.env.DEFAULT_IMAGE_URL ?? '';
  const caption = [
    `${t('Появилось')} <a href="${url}">${t('Новое объявление')}</a>: <b>${title}</b>\u2060 , ${t('В локации')}  <b>${region}</b>, ${t('C ценой')} <b>${price}</b>.`,
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

  const errorMessages = [
    'Bad Request: wrong type of the web page content',
    'Bad Request: failed to get HTTP URL content',
  ];

  try {
    await bot.sendPhoto(userId, img_url, messageOptions);
  } catch (error) {
    if (isTelegramError(error)) {
      const { error_code, description } = error.response.body;
      if (error_code === 403) {
        await db.removeUser(userId);
        return;
      }
      if (errorMessages.some((sub) => description.includes(sub))) {
        await bot.sendPhoto(userId, defaultImage, messageOptions);
        console.error('Невалидная ссылка изображения!');
        return;
      }
      console.error('Ошибка при отправке уведомления:', error);
    } else {
      console.error('Неизвестная ошибка при отправке уведомлений:', error);
    }
  }
}
