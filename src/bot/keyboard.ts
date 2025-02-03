import db from 'config/db/databaseServise';
import { t } from 'i18next';
import {
  type InlineKeyboardMarkup,
  type ReplyKeyboardMarkup,
} from 'node-telegram-bot-api';

class Keyboard {
  Main(): ReplyKeyboardMarkup {
    return {
      keyboard: [
        [{ text: t('Профиль') }, { text: t('Отслеживать') }],
        [{ text: t('Подписка') }, { text: t('Помощь') }],
        [{ text: t('Язык') }],
      ],
      resize_keyboard: true,
    };
  }

  async Profile(userID: number): Promise<InlineKeyboardMarkup> {
    return {
      inline_keyboard: [
        [
          {
            text: t('Удалить профиль'),
            callback_data: JSON.stringify({ action: 'remove_me' }),
          },
        ],
        [
          {
            text: t('Назад'),
            callback_data: JSON.stringify({ action: 'back' }),
          },
        ],
      ],
    };
  }

  Observe(): InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [
          {
            text: '🧩 Kufar.by',
            callback_data: JSON.stringify({ action: 'kufar' }),
          },
        ],
      ],
    };
  }
}

const keyboard = new Keyboard();
export default keyboard;
