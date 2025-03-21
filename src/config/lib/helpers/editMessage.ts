import { bot } from 'bot';
import { type InlineKeyboardMarkup } from 'node-telegram-bot-api';

export async function editMessage(
  chatId: number,
  messageId: number | undefined,
  newMessage: string,
  keyboard?: InlineKeyboardMarkup,
): Promise<void> {
  await bot.editMessageText(newMessage, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
}
