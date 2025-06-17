import keyboard from 'bot/keyboard';
import i18next, { t } from 'i18next';
import db from 'config/db/databaseServise';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import type { User } from 'node-telegram-bot-api';
import { type ICallbackData, type IProfile, StatusPremium } from 'config/types';
import { editMessage } from 'config/lib/helpers/editMessage';
import { Activity } from 'config/db/models/Activity';

export async function handleRegistration(
  chatId: number,
  from: User,
  messageId: number | undefined,
  callbackData: ICallbackData,
  callbackQueryId: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(chatId));
  const isRegistred = await db.getUser(chatId);
  if (!isRegistred) {
    try {
      const isChannelSubscriptionRewarded = await Activity.exists({
        userIdsSubscribedToChannel: chatId,
      });

      if (callbackData?.param)
        await db.tryAddReferralWithBonus(chatId, callbackData?.param as number);

      const { username, first_name, last_name } = from;
      const profile: IProfile = {
        username,
        first_name,
        last_name,
        subscribeToChannel: Boolean(isChannelSubscriptionRewarded),
        premium: { status: StatusPremium.NONE },
        referrals: [],
      };
      await db.setUser(chatId, profile);
      await editMessage(
        chatId,
        messageId,
        t('Успех регистрации'),
        callbackQueryId,
      );
      await sendMessage(
        chatId,
        t('Сообщение об отслеживании'),
        keyboard.Observe(),
      );
    } catch (error) {
      console.error(error);
      await sendMessage(chatId, t('Ошибка регистрации'), {
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
    await editMessage(
      chatId,
      messageId,
      t('Пользователь уже зарегистрирован'),
      callbackQueryId,
      keyboard.Observe(),
    );
  }
}
