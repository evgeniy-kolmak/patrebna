import { bot } from 'bot';
import { type Message } from 'node-telegram-bot-api';
import i18next, { t } from 'i18next';
import { Languages } from 'config/types';
import {
  getUserLanguage,
  setUserLanguage,
} from 'config/lib/helpers/cacheLaguage';
import keyboard from 'bot/keyboard';

export async function handleChangeLanguage(
  chatId: number,
  message: Message | undefined,
): Promise<void> {
  const language = await getUserLanguage(chatId);
  const newLanguage =
    language === Languages.Belarusian
      ? Languages.Russian
      : Languages.Belarusian;
  await setUserLanguage(chatId, newLanguage);
  await i18next.changeLanguage(newLanguage);
  await bot.sendMessage(chatId, t('Язык был изменен'), {
    parse_mode: 'HTML',
    reply_markup: keyboard.Main(),
  });

  if (message?.text?.includes('🔄'))
    await bot.deleteMessage(chatId, message.message_id);
  await bot.sendMessage(chatId, t('Переключить язык приложения'), {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: t('Сменить язык'),
            callback_data: JSON.stringify({ action: 'change_language' }),
          },
        ],
      ],
    },
  });
}
