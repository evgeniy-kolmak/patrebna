import { bot } from 'bot';
import { type Message } from 'node-telegram-bot-api';
import i18next, { t } from 'i18next';
import { Languages } from 'config/types';
import {
  getUserLanguage,
  setUserLanguage,
} from 'config/lib/helpers/cacheLaguage';
import keyboard from 'bot/keyboard';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import { deleteMessage } from 'config/lib/helpers/deleteMessage';

export async function handleChangeLanguage(
  chatId: number,
  message: Message | undefined,
  callbackQueryId: string,
): Promise<void> {
  const language = await getUserLanguage(chatId);
  const newLanguage =
    language === Languages.Belarusian
      ? Languages.Russian
      : Languages.Belarusian;
  await setUserLanguage(chatId, newLanguage);
  await i18next.changeLanguage(newLanguage);
  await sendMessage(chatId, t('Язык был изменен'), keyboard.Main());

  if (message?.text?.includes('🔄'))
    await deleteMessage(chatId, message?.message_id, callbackQueryId);
  await sendMessage(chatId, t('Переключить язык приложения'), {
    inline_keyboard: [
      [
        {
          text: t('Сменить язык'),
          callback_data: JSON.stringify({ action: 'change_language' }),
        },
      ],
    ],
  });
}
