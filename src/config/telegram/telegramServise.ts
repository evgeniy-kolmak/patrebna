import axios from 'axios';
import { type ChatMember } from 'node-telegram-bot-api';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TOKEN}`;

(process as any).noDeprecation = true;

export const TelegramService = {
  async sendMessage(chatId: string, text: string): Promise<void> {
    try {
      const url = `${TELEGRAM_API_URL}/sendMessage`;
      await axios.post(url, {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.error('Ошибка при отправке сообщения в Telegram:', error);
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
