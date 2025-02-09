import { bot } from 'bot';
import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { type ICallbackData } from 'config/types';
import db from 'config/db/databaseServise';
import { eventMessage } from 'config/lib/helpers/eventMessage';
import keyboard from 'bot/keyboard';
import { editMessage } from 'config/lib/helpers/editMessage';

export async function handleAddLinkKufar(
  chatId: number,
  messageId: number | undefined,
  callbackData: ICallbackData,
): Promise<void> {
  await i18next.changeLanguage(getUserLanguage(chatId));
  const urlId: number = callbackData.param;
  await editMessage(
    chatId,
    messageId,
    t('Текст для Kufar при добавлении ссылки'),
  );
  const promptKufar = await bot.sendMessage(
    chatId,
    t('Укажите ссылку для Kufar'),
    {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: t('Плейсхолдер ссылки Kufar'),
      },
    },
  );

  const { message_id } = promptKufar;
  bot.onReplyToMessage(chatId, message_id, (message) => {
    const { text } = message;
    void (async () => {
      if (text) {
        const data = await db.setUrlKufar(chatId, text, urlId);
        if (data instanceof Error) {
          await eventMessage(chatId, t('Ошибка добавления ссылки'), {
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
          await eventMessage(chatId, t('Сообщение об успехе'), keyboard.Main());
        }
      }
    })();
  });
}
