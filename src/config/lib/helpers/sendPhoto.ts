import { bot } from 'bot';
import db from 'config/db/databaseServise';
import { createReadStream } from 'fs';
import { isTelegramError } from 'config/types';
import { type InlineKeyboardMarkup } from 'node-telegram-bot-api';
import { type Stream } from 'stream';
import { pause } from 'config/lib/helpers/pause';
import { sendMessage } from 'config/lib/helpers/sendMessage';

const DEFAULT_IMAGE_PATH = 'src/bot/assets/images/no-photo.webp';

const errorMessages = [
  'Bad Request: wrong type of the web page content',
  'Bad Request: failed to get HTTP URL content',
];

export async function sendPhoto(
  id: number,
  caption: string,
  keyboard?: InlineKeyboardMarkup,
  photo?: string | Stream | Buffer,
): Promise<void> {
  try {
    await bot.sendPhoto(id, photo ?? createReadStream(DEFAULT_IMAGE_PATH), {
      parse_mode: 'HTML',
      caption,
      reply_markup: keyboard,
    });
  } catch (error) {
    if (isTelegramError(error)) {
      const payload = error.response.data ?? error.response.body;
      if (!payload) return;
      const { error_code, description, parameters } = payload;
      if (
        error_code === 403 ||
        (error_code === 400 && description.includes('USER_IS_BLOCKED'))
      ) {
        await db.removeUser(id);
        return;
      }
      if (error_code === 429) {
        const wait = (parameters?.retry_after ?? 1) * 1000;
        console.warn(
          `Слишком много запросов, повтор через ${wait / 1000} секунд`,
        );
        await pause(wait);
      }

      if (errorMessages.some((sub) => description.includes(sub))) {
        await sendPhoto(id, caption, keyboard);
        console.error('Невалидная ссылка изображения!');
      }
    } else {
      await sendMessage(id, caption, keyboard);
      console.error('Неизвестная ошибка при отправке изображения:', error);
    }
  }
}
