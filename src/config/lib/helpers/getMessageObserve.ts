import db from 'config/db/databaseServise';
import { t } from 'i18next';

export async function getMessageObserve(
  chatId: number,
  urlId: number,
): Promise<string> {
  const urlInformation = await db.getUrlInformation(chatId, urlId);

  return [
    `🔍 <b>${t('Информация о ссылке')}</b>`,
    '',
    `${t('Вот данные по запрашиваемой ссылке')}:`,
    `🔗 <b>${t('Ссылка')}:</b> ${urlInformation.url} `,
    `📌 <b>${t('Состояние')}:</b> ${urlInformation.statusUrl ? t('Активное состояние') : t('Неактивное состояние')}`,
    `🔢 <b>${t('Количество объявлений')}:</b> ${urlInformation.numberOfAds ?? 0}`,
  ].join('\n');
}
