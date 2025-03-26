import axios from 'axios';
import { type InlineKeyboardMarkup } from 'node-telegram-bot-api';
import debounce from 'lodash.debounce';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TOKEN}`;

export const TelegramService = {
  async editMessageText(
    chatId: number,
    messageId: number,
    text: string,
    keyboard?: InlineKeyboardMarkup,
  ) {
    try {
      const url = `${TELEGRAM_API_URL}/editMessageText`;
      await axios.post(url, {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: keyboard,
      });
    } catch (error) {
      console.error('Ошибка при отправке сообщения в Telegram:', error);
    }
  },
  debouncedSendMessageToChat: debounce(async (text: string) => {
    try {
      const url = `${TELEGRAM_API_URL}/sendMessage`;
      await axios.post(url, {
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.error('Ошибка при отправке сообщения в Telegram:', error);
    }
  }, 3000),
};
