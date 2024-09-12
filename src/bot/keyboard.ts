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
        [
          {
            text: t('Язык'),
          },
        ],
      ],
      resize_keyboard: true,
    };
  }

  async Profile(userID: number): Promise<InlineKeyboardMarkup> {
    const profile = await db.getProfile(userID);
    return {
      inline_keyboard: [
        [
          {
            text: `${profile?.link ? t('Изменить ссылку') : t('Добавить ссылку')}`,
            callback_data: 'add_link_kufar',
          },
        ],
        [
          {
            text: t('Удалить профиль'),
            callback_data: 'remove_me',
          },
        ],
        [{ text: t('Назад'), callback_data: 'back' }],
      ],
    };
  }

  Observe(): InlineKeyboardMarkup {
    return {
      inline_keyboard: [[{ text: '🧩 Kufar.by', callback_data: 'kufar' }]],
    };
  }

  SomeButtons(data: Array<[string, string]>): InlineKeyboardMarkup {
    return {
      inline_keyboard: data.map((button) => [
        { text: button[0], callback_data: button[1] },
      ]),
    };
  }

  Button(text: string, callback_data: string): InlineKeyboardMarkup {
    return {
      inline_keyboard: [[{ text, callback_data }]],
    };
  }
}

const keyboard = new Keyboard();
export default keyboard;
