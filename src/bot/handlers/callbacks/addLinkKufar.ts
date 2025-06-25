import { bot } from 'bot';
import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { type ICallbackData } from 'config/types';
import db from 'config/db/databaseServise';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import { editMessage } from 'config/lib/helpers/editMessage';
import keyboard from 'bot/keyboard';

export async function handleAddLinkKufar(
  chatId: number,
  messageId: number | undefined,
  callbackData: ICallbackData,
  callbackQueryId: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(chatId));
  const urlId: number = callbackData.param;
  await editMessage(
    chatId,
    messageId,
    t('Текст для Kufar при добавлении ссылки'),
    callbackQueryId,
  );

  const promptKufar = await sendMessage(chatId, t('Укажите ссылку для Kufar'), {
    force_reply: true,
    input_field_placeholder: t('Плейсхолдер ссылки Kufar'),
  });

  if (promptKufar) {
    bot.onReplyToMessage(chatId, promptKufar?.message_id, (message) => {
      const { text } = message;
      void (async () => {
        if (text) {
          const data = await db.setUrlKufar(chatId, text, urlId);
          if (data instanceof Error) {
            await sendMessage(chatId, t('Ошибка добавления ссылки'), {
              inline_keyboard: [
                [
                  {
                    text: t('Добавить ссылку'),
                    callback_data: JSON.stringify({
                      action: 'add_link_kufar',
                      param: urlId,
                    }),
                  },
                ],
                [
                  {
                    text: t('Назад'),
                    callback_data: JSON.stringify({
                      action: 'back_observe',
                    }),
                  },
                ],
              ],
            });
          } else {
            await sendMessage(
              chatId,
              t('Сообщение об успехе'),
              keyboard.Main(),
            );
          }
        }
      })();
    });
  }
}
