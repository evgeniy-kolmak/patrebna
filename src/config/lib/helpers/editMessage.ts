import { bot } from 'bot';
import { type IErrorTelegram } from 'config/types';
import { t } from 'i18next';
import { type InlineKeyboardMarkup } from 'node-telegram-bot-api';

export async function editMessage(
  chatId: number,
  messageId: number | undefined,
  newMessage: string,
  callbackQueryId: string,
  keyboard?: InlineKeyboardMarkup,
): Promise<void> {
  try {
    await bot.editMessageText(newMessage, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      reply_markup: keyboard,
      disable_web_page_preview: true,
    });
  } catch (error) {
    const err = error as IErrorTelegram;
    const { description } = err.response.body;
    if (description.includes('Bad Request: message is not modified')) {
      await bot.answerCallbackQuery(callbackQueryId, {
        text: t('Ошибка редактирования сообщения'),
        show_alert: true,
      });
      return;
    }
    await bot.answerCallbackQuery(callbackQueryId, {
      text: t('Неизвестная ошибка'),
      show_alert: true,
    });
    console.error(error);
  }
}
