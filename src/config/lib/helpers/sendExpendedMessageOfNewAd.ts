import { bot } from 'bot';
import { type ExtendedAdForDescription, isTelegramError } from 'config/types';
import { truncateString } from 'config/lib/helpers/truncateString';
import i18next, { t } from 'i18next';
import { pause } from 'config/lib/helpers/pause';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import { type InlineKeyboardMarkup } from 'node-telegram-bot-api';

interface SendMessageOfNewAdProps extends ExtendedAdForDescription {
  userId: number;
}

export async function sendExpendedMessageOfNewAd(
  ad: SendMessageOfNewAdProps,
): Promise<string | undefined> {
  const {
    userId,
    images,
    price,
    title,
    url,
    coordinates,
    description,
    region,
    parameters,
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
  } = parameters;

  const message = [
    `${t('Появилось')} <a href="${url}">${t('Новое объявление')}</a>\u00A0: <b>${title}</b>, ${t('В локации')} <b>${region}</b>, ${t('C ценой')} <b>${price}</b>.`,
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

  try {
    await bot.sendMediaGroup(userId, images);
    await sendMessage(userId, message, keyboardForMessage);
  } catch (error) {
    if (isTelegramError(error)) {
      const { error_code, parameters: errorParams } = error.response.body;
      if (error_code === 403) return 'User is blocked';
      if (error_code === 429) {
        const wait = (errorParams?.retry_after ?? 1) * 1000;
        console.warn(`Слишком много запросов, ждем ${wait}ms`);
        await pause(wait);
        return await sendExpendedMessageOfNewAd(ad);
      }
      console.error('Ошибка при отправке уведомления:', error);
    } else {
      console.error('Неизвестная ошибка при отправке уведомлений:', error);
    }
  }
}
