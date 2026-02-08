import keyboards from 'bot/keyboards';
import i18next, { t } from 'i18next';
import db from 'config/db/databaseServise';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import type { User } from 'node-telegram-bot-api';
import { type ICallbackData, type IProfile, StatusPremium } from 'config/types';
import { editMessage } from 'config/lib/helpers/editMessage';
import { deleteMessage } from 'config/lib/helpers/deleteMessage';
import { Activity } from 'config/db/models/Activity';
import cache from 'config/redis/redisService';

export async function handleRegistration(
  userId: number,
  from: User,
  messageId: number | undefined,
  callbackData: ICallbackData,
  callbackQueryId: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(userId));
  const isRegistred = await db.getUser(userId);
  const isTrial = await db.hasUsedTrial(userId);
  if (!isRegistred) {
    const lockKey = `registering:${userId}`;
    const isLocked = await cache.setCacheNotExists(lockKey, true);
    if (!isLocked) {
      if (messageId) await deleteMessage(userId, messageId, callbackQueryId);
      return;
    }

    try {
      const isChannelSubscriptionRewarded = await Activity.exists({
        userIdsSubscribedToChannel: userId,
      });

      if (callbackData?.param)
        await db.tryAddReferralWithBonus(userId, callbackData?.param as number);

      const { username, first_name, last_name } = from;
      const profile: IProfile = {
        username,
        first_name,
        last_name,
        subscribeToChannel: Boolean(isChannelSubscriptionRewarded),
        premium: { status: StatusPremium.NONE },
      };
      await db.setUser(userId, profile);
      await editMessage(
        userId,
        messageId,
        t('Успех регистрации'),
        callbackQueryId,
      );

      await sendMessage(
        userId,
        isTrial ? t('Триал использован') : t('Триал  сообщение'),
        keyboards.Trial(isTrial),
      );
    } catch (error) {
      console.error(error);
      await sendMessage(userId, t('Ошибка регистрации'), {
        inline_keyboard: [
          [
            {
              text: t('Регистрация'),
              callback_data: JSON.stringify({ action: 'registration' }),
            },
          ],
        ],
      });
    } finally {
      await cache.removeCache(lockKey);
    }
  } else {
    await editMessage(
      userId,
      messageId,
      t('Пользователь уже зарегистрирован'),
      callbackQueryId,
      keyboards.Trial(isTrial),
    );
  }
}
