import i18next, { t } from 'i18next';
import { type INotification, type IExtendedAd } from 'config/types';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { truncateString } from 'config/lib/helpers/truncateString';

export async function getExtendedNotification(
  ad: IExtendedAd & { userId: number; description: string },
): Promise<INotification & { coordinates?: number[] }> {
  const {
    saller_id,
    saller_name,
    userId,
    img_url,
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

  const sellerProfileUrl = `https://www.kufar.by/user/${saller_id}`;

  return {
    url,
    image: img_url,
    coordinates,
    caption: [
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
      .join('\n'),
  };
}
