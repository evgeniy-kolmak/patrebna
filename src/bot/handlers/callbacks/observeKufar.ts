import { bot } from 'bot';
import db from 'config/db/databaseServise';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { getMessageObserve } from 'config/lib/helpers/getMessageObserve';
import { getObserveButton } from 'config/lib/helpers/getObserveButton';
import { type IButton, Button, StatusPremium } from 'config/types';
import i18next, { t } from 'i18next';

export async function handleObserveKufar(
  chatId: number,
  messageId: number | undefined,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(chatId));
  const dataParser = await db.getDataParser(chatId);
  const statusPremium = await db.getDataPremium(chatId);
  const quantityUrls = dataParser?.urls.length;
  const firstUrl = dataParser?.urls.find((url) => url.urlId === 1);

  const inlineKeyboard: IButton[][] = [getObserveButton()];
  let message = t('Текст для Kufar');

  if (!firstUrl) {
    inlineKeyboard.unshift(getObserveButton(Button.ADD, 1));
  }

  if (firstUrl && statusPremium?.status !== StatusPremium.ACTIVE) {
    message = await getMessageObserve(chatId, 1);
    const { isActive, urlId } = firstUrl;
    inlineKeyboard.unshift(
      getObserveButton(Button.UPDATE, urlId),
      isActive
        ? getObserveButton(Button.STOP_OBSERVE, urlId)
        : getObserveButton(Button.START_OBSERVE, urlId),
      getObserveButton(Button.DELETE, urlId),
    );
  }

  if (quantityUrls && statusPremium?.status === StatusPremium.ACTIVE) {
    if (quantityUrls < 3)
      inlineKeyboard.unshift(
        getObserveButton(Button.ADD_MORE, quantityUrls + 1),
      );
    const wrapButtons: IButton[][] = [];

    const sortedUrls = [...dataParser.urls].sort((a, b) => a.urlId - b.urlId);

    for (let i = 0; i < quantityUrls; i++) {
      wrapButtons.push(getObserveButton(Button.WRAP, sortedUrls[i].urlId));
    }

    inlineKeyboard.unshift(...wrapButtons);
  }
  await bot.editMessageText(message, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: inlineKeyboard },
  });
}
