import { bot } from 'bot';
import { type IAd } from 'config/types';
import { truncateString } from 'config/lib/helpers/truncateString';

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
  await bot.sendPhoto(userId, `${img_url}`, {
    caption: `Появилось новое объявление: <b>${title}</b>, c ценой <b>${price}</b>.\n<i>${
      description ? truncateString(description, 500) + '\n' : ''
    }</i><a href="${url}">Подробнее</a>`,
    parse_mode: 'HTML',
  });
}
