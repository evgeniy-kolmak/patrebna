import axios from 'axios';
import db from 'config/db/databaseServise';
import FormData from 'form-data';
import { type InlineKeyboardMarkup } from 'node-telegram-bot-api';
import { type Stream } from 'stream';
import { isTelegramError } from 'config/types';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TOKEN}`;

(process as any).noDeprecation = true;

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
      if (isTelegramError(error)) {
        const payload = error.response.data ?? error.response.body;
        if (!payload) return;
        const { error_code, description } = payload;
        if (description.includes('Bad Request: message is not modified')) {
          console.log(
            'Сообщение не было изменено, так как содержимое осталось тем же.',
          );
          return;
        }
        if (
          error_code === 403 ||
          (error_code === 400 && description.includes('USER_IS_BLOCKED'))
        ) {
          await db.removeUser(chatId);
          return;
        }

        console.error('Ошибка при отправке сообщения в Telegram:', error);
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
  async sendDocument(
    chatId: number,
    document: string | Stream | Buffer,
    caption: string,
    filename: string,
  ) {
    try {
      const url = `${TELEGRAM_API_URL}/sendDocument`;
      const form = new FormData();
      form.append('chat_id', chatId);
      form.append('document', document, { filename });
      form.append('caption', caption);

      await axios.post(url, form, {
        headers: form.getHeaders(),
      });
    } catch (error) {
      if (isTelegramError(error)) {
        const payload = error.response.data ?? error.response.body;

        if (!payload) return;

        const { error_code, description } = payload;
        if (
          error_code === 403 ||
          (error_code === 400 && description.includes('USER_IS_BLOCKED'))
        ) {
          await db.removeUser(chatId);
          return;
        }
        console.error('Ошибка при отправке документа в Telegram:', error);
      }
      console.error('Неизвестная ошибка:', error);
    }
  },
  async sendChatAction(chatId: number) {
    try {
      const url = `${TELEGRAM_API_URL}/sendChatAction`;
      await axios.post(url, {
        chat_id: chatId,
        action: 'upload_document',
      });
    } catch (error) {
      console.error('Ошибка при отправке действия в Telegram:', error);
    }
  },
};
