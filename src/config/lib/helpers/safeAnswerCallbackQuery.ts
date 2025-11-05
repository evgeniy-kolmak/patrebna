import { bot } from 'bot';
import { type AnswerCallbackQueryOptions } from 'node-telegram-bot-api';

export async function safeAnswerCallbackQuery(
  id: string,
  options?: Partial<AnswerCallbackQueryOptions>,
): Promise<void> {
  try {
    await bot.answerCallbackQuery(id, options);
  } catch (e) {
    console.warn('CallbackQuery просрочен или недействителен');
  }
}
