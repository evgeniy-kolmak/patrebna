import { bot } from 'bot';
import { type InlineKeyboardMarkup } from 'node-telegram-bot-api';
import { safeAnswerCallbackQuery } from 'config/lib/helpers/safeAnswerCallbackQuery';
import { isTelegramError } from 'config/types';
import { t } from 'i18next';

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
    if (isTelegramError(error)) {
      const { description } = error.response.body;
      if (description.includes('Bad Request: message is not modified')) {
        await safeAnswerCallbackQuery(callbackQueryId, {
          text: t('Ошибка редактирования сообщения'),
          show_alert: true,
        });
        return;
      }
      if (description.includes('Bad Request: message to edit not found')) {
        await safeAnswerCallbackQuery(callbackQueryId, {
          text: t('Cообщение для редактирования не найдено'),
          show_alert: true,
        });
        return;
      }
    }
    await safeAnswerCallbackQuery(callbackQueryId, {
      text: t('Неизвестная ошибка'),
      show_alert: true,
    });
    console.error('Ошибка при редактировании сообщения', error);
  }
}
