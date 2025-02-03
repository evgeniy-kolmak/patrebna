import { bot } from 'bot';
import keyboard from 'bot/keyboard';
import i18next, { t } from 'i18next';
import db from 'config/db/databaseServise';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { eventMessage } from 'config/lib/helpers/eventMessage';
import type { User } from 'node-telegram-bot-api';
import { type IProfile, StatusPremium } from 'config/types';

export async function handleRegistration(
  chatId: number,
  from: User,
  messageId: number | undefined,
): Promise<void> {
  await i18next.changeLanguage(getUserLanguage(chatId));
  const isRegistred = await db.getUser(chatId);
  if (!isRegistred) {
    try {
      const { username, first_name, last_name } = from;
      const profile: IProfile = {
        username,
        first_name,
        last_name,
        premium: { status: StatusPremium.NONE },
        referrals: [],
      };
      await db.setUser(chatId, profile);
      await bot.editMessageText(t('Успех регистрации'), {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: await keyboard.Profile(chatId),
      });
    } catch (error) {
      console.error(error);
      await eventMessage(chatId, t('Ошибка регистрации'), {
        inline_keyboard: [
          [
            {
              text: t('Регистрация'),
              callback_data: JSON.stringify({ action: 'registration' }),
            },
          ],
        ],
      });
    }
  } else {
    await bot.editMessageText(t('Пользователь уже зарегистрирован'), {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      reply_markup: keyboard.Observe(),
    });
  }
}
