import { bot } from 'bot';
import { type IErrorTelegram } from 'config/types';
import { t } from 'i18next';

export async function deleteMessage(
  chatId: number,
  messageId: number,
  callbackQueryId: string,
): Promise<void> {
  try {
    await bot.deleteMessage(chatId, messageId);
  } catch (error) {
    const err = error as IErrorTelegram;
    const { description } = err.response.body;
    if (description.includes('Bad Request: message to delete not found')) {
      await bot.answerCallbackQuery(callbackQueryId, {
        text: t('Ошибка удаления сообщения'),
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
