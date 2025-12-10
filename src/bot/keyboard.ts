import { t } from 'i18next';
import {
  type InlineKeyboardMarkup,
  type ReplyKeyboardMarkup,
} from 'node-telegram-bot-api';
import { dataFaq } from 'constants/faq';

class Keyboard {
  Main(): ReplyKeyboardMarkup {
    return {
      keyboard: [
        [{ text: `👤 ${t('Профиль')}` }, { text: `👁️ ${t('Отслеживать')}` }],
        [{ text: `⭐️ ${t('Подписка')}` }, { text: `❓ ${t('Помощь')}` }],
        [{ text: t('Язык') }],
      ],
      resize_keyboard: true,
    };
  }

  async Profile(): Promise<InlineKeyboardMarkup> {
    return {
      inline_keyboard: [
        [
          {
            text: t('Удалить профиль'),
            callback_data: JSON.stringify({ action: 'remove_me' }),
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

  Faq(): InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        ...dataFaq.map(({ question }, index) => [
          {
            text: t(question),
            callback_data: JSON.stringify({
              action: 'faq_question_open',
              param: index,
            }),
          },
        ]),
      ],
    };
  }

  Premium(): InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [
          {
            text: t('Купить подписку'),
            callback_data: JSON.stringify({ action: 'buy_premium' }),
          },
        ],
        [
          {
            text: t('Получить подписку'),
            callback_data: JSON.stringify({ action: 'get_free_premium' }),
          },
        ],
      ],
    };
  }

  BaseForMessage(url: string): InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [
          {
            text: t('Подробнее'),
            web_app: { url },
          },
        ],
      ],
    };
  }

  ExpendedForMessage(
    url: string,
    coordinates?: number[],
  ): InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [
          ...(coordinates
            ? [
                {
                  text: t('Показать на карте'),
                  callback_data: JSON.stringify({
                    action: 'on_map',
                    param: coordinates,
                  }),
                },
              ]
            : []),
          {
            text: t('Подробнее'),
            web_app: { url },
          },
        ],
      ],
    };
  }
}

const keyboard = new Keyboard();
export default keyboard;
