import i18next from 'i18next';
import db from 'config/db/databaseServise';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { getObserveButton } from 'config/lib/helpers/getObserveButton';
import { Button, type ICallbackData, type IButton } from 'config/types';
import { getMessageObserve } from 'config/lib/helpers/getMessageObserve';
import { editMessage } from 'config/lib/helpers/editMessage';

export async function handleChangeUrlStatus(
  chatId: number,
  messageId: number | undefined,
  callbackData: ICallbackData,
  callbackQueryId: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(chatId));
  const urlId: number = callbackData.param;
  const statusUrl = await db.toggleUrlStatus(chatId, urlId);

  const inlineKeyboard: IButton[][] = [getObserveButton(Button.BACK)];
  inlineKeyboard.unshift(
    getObserveButton(Button.UPDATE, urlId),
    statusUrl
      ? getObserveButton(Button.STOP_OBSERVE, urlId)
      : getObserveButton(Button.START_OBSERVE, urlId),
    getObserveButton(Button.DELETE, urlId),
  );
  const message = await getMessageObserve(chatId, urlId);

  await editMessage(chatId, messageId, message, callbackQueryId, {
    inline_keyboard: inlineKeyboard,
  });
}
