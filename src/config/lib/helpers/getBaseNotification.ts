import i18next, { t } from 'i18next';
import { type INotification, type IAd } from 'config/types';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';

const HOST = process.env.HOST_API ?? '';

export async function getBaseNotification(
  ad: IAd & { userId: number },
): Promise<INotification> {
  const { userId, id, img_url, price, title, region } = ad;
  const url = `https://${HOST}/ad/${id}`;
  await i18next.changeLanguage(await getUserLanguage(userId));
  return {
    url,
    image: img_url,
    caption:
      `${t('Появилось')} <a href="${url}">${t('Новое объявление')}</a>: <b>${title}</b> ${t('В локации')} <b>${region}</b> ${t('C ценой')} <b>${price}</b>.`.trim(),
  };
}
