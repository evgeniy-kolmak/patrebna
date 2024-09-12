import {
  type InlineKeyboardMarkup,
  type ReplyKeyboardMarkup,
} from 'node-telegram-bot-api';
import { bot } from 'bot';

export async function eventMessage(
  id: number,
  message: string,
  markup: InlineKeyboardMarkup | ReplyKeyboardMarkup,
): Promise<void> {
  await bot.sendMessage(id, message, {
    reply_markup: markup,
    parse_mode: 'HTML',
  });
}
