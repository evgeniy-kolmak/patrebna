import { bot } from 'bot';
import db from 'config/db/databaseServise';
import { isTelegramError } from 'config/types';
import type TelegramBot from 'node-telegram-bot-api';
import {
  type ReplyKeyboardMarkup,
  type InlineKeyboardMarkup,
  type ForceReply,
} from 'node-telegram-bot-api';

export async function sendMessage(
  id: number,
  message: string,
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ForceReply,
): Promise<TelegramBot.Message | undefined> {
  try {
    return await bot.sendMessage(id, message, {
      reply_markup,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  } catch (error) {
    if (isTelegramError(error)) {
      const { error_code } = error.response.body;
      if (error_code === 403) {
        await db.removeUser(id);
        console.error('Заблокированный пользователь был удален!');
      } else {
        console.error('Ошибка при отправке уведомления:', error);
      }
    }
  }
}
