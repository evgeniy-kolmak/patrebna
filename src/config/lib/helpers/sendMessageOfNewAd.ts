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
  await i18next.changeLanguage(getUserLanguage(userId));
  await bot.sendPhoto(userId, `${img_url}`, {
    caption: `${t('Появилось новое объявление')}: <b>${title}</b>, ${t('C ценой')} <b>${price}</b>.\n<i>${
      description ? truncateString(description, 500) + '\n' : ''
    }</i><a href="${url}">Подробнее</a>`,
    parse_mode: 'HTML',
  });
}
