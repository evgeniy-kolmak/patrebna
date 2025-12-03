import { bot } from 'bot';
import db from 'config/db/databaseServise';
import { type ExtendedAdForDescription, isTelegramError } from 'config/types';
import { truncateString } from 'config/lib/helpers/truncateString';
import i18next, { t } from 'i18next';
import { pause } from 'config/lib/helpers/pause';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { sendPhoto } from 'config/lib/helpers/sendPhoto';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import { type InlineKeyboardMarkup } from 'node-telegram-bot-api';
import { getUserLock } from 'config/lib/helpers/userMessageLock';

interface SendMessageOfNewAdProps extends ExtendedAdForDescription {
  userId: number;
}

export async function sendExpendedMessageOfNewAd(
  ad: SendMessageOfNewAdProps,
): Promise<void> {
  const errorMessages = ['WEBPAGE_MEDIA_EMPTY', 'WEBPAGE_CURL_FAILED'];
  const {
    saller_id,
    saller_name,
    userId,
    img_url,
    images,
    price,
    title,
    url,
    coordinates,
    description,
    region,
    ad_parameters,
  } = ad;
  await i18next.changeLanguage(await getUserLanguage(userId));
  const {
    size,
    square_meter,
    rooms,
    floor,
    re_number_floors,
    year_built,
    regdate,
    mileage,
    cars_type,
    cars_engine,
    cars_capacity,
    cars_gearbox,
    condition,
    delivery_enabled,
    safedeal_enabled,
  } = ad_parameters ?? {};

  const lock = getUserLock(userId);
  const sellerProfileUrl = `https://www.kufar.by/user/${saller_id}`;

  const caption = [
    `${t('Появилось')} <a href="${url}">${t('Новое объявление')}</a>: <b>${title}</b> ${t('В локации')} <b>${region}</b> ${t('C ценой')} <b>${price}</b>.`.trim(),
    `<i>${truncateString(description, 500)}</i>`,
    size ? `<b>${t('Общая площадь')}</b>: ${size}м²` : '',
    square_meter ? `<b>${t('Цена')} за м²</b>: ${square_meter}$` : '',
    rooms ? `<b>${t('Количество комнат')}</b>: ${rooms}` : '',
    floor && re_number_floors
      ? `<b>${t('Этаж')}</b>: ${floor} из ${re_number_floors}`
      : '',
    year_built ? `<b>${t('Год постройки')}</b>: ${year_built}` : '',
    regdate ? `<b>${t('Год выпуска')}</b>: ${regdate}` : '',
    mileage
      ? `<b>${t('Пробег')}</b>: ${mileage.toString().replace(/\D+/g, '')}км`
      : '',
    cars_type ? `<b>${t('Тип кузова')}</b>: ${cars_type}` : '',
    cars_gearbox ? `<b>${t('Коробка передач')}</b>: ${cars_gearbox}` : '',
    cars_engine ? `<b>${t('Тип двигателя')}</b>: ${cars_engine}` : '',
    cars_capacity ? `<b>${t('Объем')}</b>: ${cars_capacity}.` : '',
    saller_id && saller_name
      ? `<b>${t('Продавец')}</b>: <a href="${sellerProfileUrl}">${saller_name}</a>`
      : '',
    condition ? `<b>${t('Состояние товара')}</b>: ${condition}` : '',
    safedeal_enabled && safedeal_enabled !== '-'
      ? `<b>${t('Безопасная сделка')}</b>: ${safedeal_enabled}`
      : '',
    delivery_enabled && delivery_enabled !== '-'
      ? `<b>${t('Доставка')}</b>: ${delivery_enabled}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const keyboardForMessage: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        ...(coordinates
          ? [
              {
                text: t('Показать на карте'),
                callback_data: JSON.stringify({
                  action: 'on_map',
                  param: coordinates,
                }),
              },
            ]
          : []),
        {
          text: t('Подробнее'),
          web_app: { url },
        },
      ],
    ],
  };
  await lock.runExclusive(async () => {
    try {
      if (!images.length) {
        await sendPhoto(userId, caption, keyboardForMessage);
        return;
      }
      if (images.length === 1) {
        await sendPhoto(userId, caption, keyboardForMessage, img_url);
        return;
      }
      await bot.sendMediaGroup(userId, images);
      await sendMessage(userId, caption, keyboardForMessage);
    } catch (error) {
      if (isTelegramError(error)) {
        const { error_code, parameters, description } = error.response.body;
        if (
          error_code === 400 &&
          errorMessages.some((e) => description.includes(e))
        ) {
          const match = description.match(/message\s+#(\d+)/i);
          const failedIndex = match ? Number(match[1]) - 1 : null;
          if (failedIndex !== null && images[failedIndex]) {
            images.splice(failedIndex, 1);
            await sendExpendedMessageOfNewAd(ad);
            return;
          }
        }
        if (
          error_code === 403 ||
          (error_code === 400 && description.includes('USER_IS_BLOCKED'))
        ) {
          await db.removeUser(userId);
          return;
        }
        if (error_code === 429) {
          const wait = (parameters?.retry_after ?? 1) * 1000;
          console.warn(
            `Слишком много запросов, повтор через ${wait / 1000}секунд`,
          );
          await pause(wait);
          await sendExpendedMessageOfNewAd(ad);
          return;
        }
        console.error('Неизвестная ошибка при отправке уведомлений:', error);
      }
    }
  });
}
