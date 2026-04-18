import axios from 'axios';
import db from 'config/db/databaseServise';
import { isTelegramError } from 'config/types';
import {
  type InlineKeyboardMarkup,
  type ChatMember,
} from 'node-telegram-bot-api';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TOKEN}`;

(process as any).noDeprecation = true;

interface TelegramResponse<T> {
  ok: boolean;
  result: T;
}

interface TelegramMessage {
  message_id: number;
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text?: string;
}
export const TelegramService = {
  async sendMessage(
    chatId: string,
    text: string,
    keyboard?: InlineKeyboardMarkup,
  ): Promise<TelegramResponse<TelegramMessage> | undefined> {
    try {
      const url = `${TELEGRAM_API_URL}/sendMessage`;
      const { data } = await axios.post(url, {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        ...(keyboard && { reply_markup: keyboard }),
      });
      return data;
    } catch (error) {
      if (isTelegramError(error)) {
        const payload = error.response.data ?? error.response.body;
        if (!payload) return;
        const { error_code, description } = payload;
        if (
          error_code === 403 ||
          (error_code === 400 && description.includes('USER_IS_BLOCKED'))
        )
          await db.removeUser(Number(chatId));
        return;
      }
      console.error('Ошибка при отправке сообщения в Telegram:', error);
    }
  },
  async editMessageReplyMarkup(
    chatId: string,
    messageId: number,
    keyboard: InlineKeyboardMarkup,
  ): Promise<void> {
    try {
      const url = `${TELEGRAM_API_URL}/editMessageReplyMarkup`;
      await axios.post(url, {
        chat_id: chatId,
        message_id: messageId,
        ...(keyboard && { reply_markup: keyboard }),
      });
    } catch (error) {
      console.error(
        'Ошибка при редактировании клавиатуры Telegram сообщения:',
        error,
      );
    }
  },
  async getChatMember(
    chatId: string,
    userId: number,
  ): Promise<(ChatMember & { tag?: string }) | null> {
    try {
      const url = `${TELEGRAM_API_URL}/getChatMember`;
      const { data } = await axios.get(url, {
        params: {
          chat_id: chatId,
          user_id: userId,
        },
      });
      return data.result;
    } catch (error) {
      console.error(
        'Ошибка при получении информации об участнике чата:',
        error,
      );
      return null;
    }
  },
  async setChatMemberTag(chatId: string, userId: number, tag: string) {
    try {
      const url = `${TELEGRAM_API_URL}/setChatMemberTag`;
      await axios.post(url, {
        chat_id: chatId,
        user_id: userId,
        tag,
      });
    } catch (error) {
      console.error('Ошибка при установке тега участника в Telegram:', error);
    }
  },
};
