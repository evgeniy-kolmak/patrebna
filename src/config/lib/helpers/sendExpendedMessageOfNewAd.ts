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

  const lock = getUserLock(userId);
  const sellerProfileUrl = `https://www.kufar.by/user/${saller_id}`;

  const caption = [
    `${t('Появилось')} <a href="${url}">${t('Новое объявление')}</a>: <b>${title}</b> ${t('В локации')} <b>${region}</b> ${t('C ценой')} <b>${price}</b>.`.trim(),
    `<i>${truncateString(description, 500)}</i>`,
    ad_parameters?.size
      ? `<b>${t('Общая площадь')}</b>: ${ad_parameters?.size}м²`
      : '',
    ad_parameters?.square_meter
      ? `<b>${t('Цена')} за м²</b>: ${ad_parameters?.square_meter}$`
      : '',
    ad_parameters?.rooms
      ? `<b>${t('Количество комнат')}</b>: ${ad_parameters?.rooms}`
      : '',
    ad_parameters?.floor && ad_parameters?.re_number_floors
      ? `<b>${t('Этаж')}</b>: ${ad_parameters?.floor} из ${ad_parameters?.re_number_floors}`
      : '',
    ad_parameters?.year_built
      ? `<b>${t('Год постройки')}</b>: ${ad_parameters?.year_built}`
      : '',
    ad_parameters?.regdate
      ? `<b>${t('Год выпуска')}</b>: ${ad_parameters?.regdate}`
      : '',
    ad_parameters?.mileage
      ? `<b>${t('Пробег')}</b>: ${ad_parameters?.mileage.toString().replace(/\D+/g, '')}км`
      : '',
    ad_parameters?.cars_type
      ? `<b>${t('Тип кузова')}</b>: ${ad_parameters?.cars_type}`
      : '',
    ad_parameters?.cars_gearbox
      ? `<b>${t('Коробка передач')}</b>: ${ad_parameters?.cars_gearbox}`
      : '',
    ad_parameters?.cars_engine
      ? `<b>${t('Тип двигателя')}</b>: ${ad_parameters?.cars_engine}`
      : '',
    ad_parameters?.cars_capacity
      ? `<b>${t('Объем')}</b>: ${ad_parameters?.cars_capacity}.`
      : '',
    saller_id && saller_name
      ? `<b>${t('Продавец')}</b>: <a href="${sellerProfileUrl}">${saller_name}</a>`
      : '',
    ad_parameters?.condition
      ? `<b>${t('Состояние товара')}</b>: ${ad_parameters?.condition}`
      : '',
    ad_parameters?.safedeal_enabled && ad_parameters?.safedeal_enabled !== '-'
      ? `<b>${t('Безопасная сделка')}</b>: ${ad_parameters?.safedeal_enabled}`
      : '',
    ad_parameters?.delivery_enabled && ad_parameters?.delivery_enabled !== '-'
      ? `<b>${t('Доставка')}</b>: ${ad_parameters?.delivery_enabled}`
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
