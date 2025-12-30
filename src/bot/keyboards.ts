import { t } from 'i18next';
import {
  type InlineKeyboardMarkup,
  type ReplyKeyboardMarkup,
} from 'node-telegram-bot-api';
import { dataFaq } from 'constants/faq';

class KeyboardManager {
  Main(): ReplyKeyboardMarkup {
    return {
      keyboard: [
        [{ text: `👤 ${t('Профиль')}` }, { text: `👁️ ${t('Отслеживать')}` }],
        [{ text: `⭐️ ${t('Подписка')}` }, { text: `❓ ${t('Помощь')}` }],
        [{ text: `${t('Язык')}` }],
      ],
      resize_keyboard: true,
    };
  }

  Profile(): InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [
          {
            text: t('Магазин'),
            callback_data: JSON.stringify({ action: 'store' }),
          },
          {
            text: t('Кошелёк'),
            callback_data: JSON.stringify({ action: 'wallet' }),
          },
        ],
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

  FreePremium(
    isSubscribedToChannel: boolean,
    isPlayGame: boolean,
  ): InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        isSubscribedToChannel
          ? []
          : [
              {
                text: `🔔 ${t('Подписка на канал')}`,
                callback_data: JSON.stringify({ action: 'subscribe_channel' }),
              },
            ],
        isPlayGame
          ? []
          : [
              {
                text: `🎲 ${t('Сыграть в игру')}`,
                callback_data: JSON.stringify({ action: 'play_game' }),
              },
            ],
        [
          {
            text: `${t('Пригласить друга')}`,
            callback_data: JSON.stringify({ action: 'invite_referral' }),
          },
        ],
        [
          {
            text: t('Назад'),
            callback_data: JSON.stringify({ action: 'back_premium' }),
          },
        ],
      ],
    };
  }

  Store(): InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [
          {
            text: `💎 ${t('Подписка')}`,
            callback_data: JSON.stringify({
              action: 'buy_premium_with_bonuses',
            }),
          },
        ],
        [
          {
            text: `🎮 ${t('Дополнительная попытка в игре')}`,
            callback_data: JSON.stringify({
              action: 'buy_try_to_play_game',
            }),
          },
        ],
      ],
    };
  }

  Wallet(isCompleted: boolean): InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [
          {
            text: t('Пополнить баланс'),
            callback_data: JSON.stringify({ action: 'wallet_top_up' }),
          },
        ],
        [
          ...(!isCompleted
            ? [
                {
                  text: t('Ежедневный бонус'),
                  callback_data: JSON.stringify({ action: 'daily_bonus' }),
                },
              ]
            : []),
        ],
      ],
    };
  }

  Game(): InlineKeyboardMarkup {
    const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
    return {
      inline_keyboard: [
        numberEmojis.slice(0, 3).map((_n, i) => ({
          text: `${numberEmojis[i]}`,
          callback_data: JSON.stringify({
            action: 'choice_game',
            param: i + 1,
          }),
        })),
        numberEmojis.slice(3).map((_n, i) => ({
          text: `${numberEmojis[i + 3]}`,
          callback_data: JSON.stringify({
            action: 'choice_game',
            param: i + 4,
          }),
        })),
        [
          {
            text: t('Назад'),
            callback_data: JSON.stringify({ action: 'get_free_premium' }),
          },
        ],
      ],
    };
  }

  notEnoughBonusesKeyboard(): InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [
          {
            text: t('Пополнить баланс'),
            callback_data: JSON.stringify({ action: 'wallet_top_up' }),
          },
        ],
        [
          {
            text: t('Назад'),
            callback_data: JSON.stringify({ action: 'back_store' }),
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

const keyboards = new KeyboardManager();
export default keyboards;
