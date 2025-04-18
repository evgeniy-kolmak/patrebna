import axios, { AxiosError } from 'axios';
import { type InlineKeyboardMarkup } from 'node-telegram-bot-api';
import db from 'config/db/databaseServise';
import cache from 'config/redis/redisService';

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
      const key = `edited:${chatId}-${messageId}`;
      const wasEdited = await cache.getCache(key);
      if (wasEdited && JSON.parse(wasEdited)) return;
      const url = `${TELEGRAM_API_URL}/editMessageText`;
      await axios.post(url, {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: keyboard,
      });
      await cache.setCache(key, true, 1500);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 403) {
          await db.removeUser(chatId);
          console.error('Заблокированный пользователь был удален!');
        } else {
          console.error('Ошибка при отправке сообщения в Telegram:', error);
        }
        return;
      }
      console.error('Неизвестная ошибка:', error);
    }
  },
  async sendMessageToChat(text: string) {
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
  },
};
