/* eslint-disable @typescript-eslint/naming-convention */
import { bot } from 'bot';
import i18next, { t } from 'i18next';
import db from 'config/db/databaseServise';
import keyboards from 'bot/keyboards';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { notRegistrationMessage } from 'config/lib/helpers/notRegistrationMessage';
import { type ICallbackData } from 'config/types';
import { handleRegistration } from 'bot/handlers/callbacks/registration';
import { handleAddLinkKufar } from 'bot/handlers/callbacks/addLinkKufar';
import { handleChangeLanguage } from 'bot/handlers/callbacks/changeLanguage';
import { handleChooseTariff } from 'bot/handlers/callbacks/chooseTariff';
import { handleBuyPremium } from 'bot/handlers/callbacks/buyPremium';
import { handleObserveKufar } from 'bot/handlers/callbacks/observeKufar';
import { handleChangeUrlStatus } from 'bot/handlers/callbacks/changeUrlStatus';
import { handleWrapperForLink } from 'bot/handlers/callbacks/wrapperForLink';
import { handleGetFreePremium } from 'bot/handlers/callbacks/getFreePremium';
import { handleSubscribeToChannel } from 'bot/handlers/callbacks/subscribeToChannel';
import { handleChekOnSubscribeToChannel } from 'bot/handlers/callbacks/checkOnSubscribeToChannel';
import { handleInviteReferral } from 'bot/handlers/callbacks/inviteReferral';
import { handleOpenQuestionFaq } from 'bot/handlers/callbacks/openQuestionFaq';
import { getDailyBonus } from 'bot/handlers/callbacks/getDailyBonus';
import { handleBuyBonus } from 'bot/handlers/callbacks/buyBonus';
import { handleChooseRate } from 'bot/handlers/callbacks/chooseRate';
import { checkStatusOfDailyBonus } from 'config/lib/helpers/checkStatusOfDailyBonus';
import { getDataWallet } from 'config/lib/helpers/getDataWallet';
import { editMessage } from 'config/lib/helpers/editMessage';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import { сommandsWrapper } from 'config/lib/helpers/сommandsWrapper';
import { сommandHandlers } from 'constants/сommandHandlers';

export default async (): Promise<void> => {
  bot.on('callback_query', async (query): Promise<void> => {
    const { data, from, id: callbackQueryId, message } = query;
    const chatId = from.id;
    const isRegistered = await db.getUser(chatId);
    const isBlocked = await db.isUserBlocked(chatId);
    if (isBlocked) {
      await sendMessage(
        chatId,
        t('Сообщение для заблокированного пользователя'),
      );
      return;
    }
    let callbackData: ICallbackData;
    try {
      const parsed = JSON.parse(data ?? '{}');
      if (typeof parsed === 'object' && parsed !== null && 'action' in parsed) {
        callbackData = parsed;
      } else {
        throw new Error('Невалидный JSON');
      }
    } catch {
      callbackData = { action: data ?? '' };
    }

    if (!isRegistered && callbackData?.action !== 'registration') {
      await notRegistrationMessage(chatId);
      return;
    }

    const messageId = message?.message_id;
    const language = await getUserLanguage(chatId);
    switch (callbackData.action) {
      case 'registration': {
        await handleRegistration(
          chatId,
          from,
          messageId,
          callbackData,
          callbackQueryId,
        );
        break;
      }
      case 'change_language': {
        await handleChangeLanguage(chatId, message, callbackQueryId);
        break;
      }
      case 'kufar': {
        await handleObserveKufar(chatId, messageId, callbackQueryId);
        break;
      }
      case 'add_link_kufar': {
        await handleAddLinkKufar(
          chatId,
          messageId,
          callbackData,
          callbackQueryId,
        );
        break;
      }
      case 'change_status_link_kufar': {
        await handleChangeUrlStatus(
          chatId,
          messageId,
          callbackData,
          callbackQueryId,
        );
        break;
      }

      case 'remove_link_kufar': {
        await i18next.changeLanguage(language);
        const urlId: number = callbackData.param;
        await db.removeUrlKufar(chatId, urlId);
        await handleObserveKufar(chatId, messageId, callbackQueryId);
        await sendMessage(chatId, t('Ссылка удалена'));
        break;
      }
      case 'wrap_link': {
        await handleWrapperForLink(
          chatId,
          messageId,
          callbackData,
          callbackQueryId,
        );
        break;
      }
      case 'buy_premium': {
        await handleBuyPremium(chatId, messageId, callbackQueryId);
        break;
      }
      case 'choose_tariff': {
        await handleChooseTariff(
          chatId,
          messageId,
          callbackData,
          callbackQueryId,
        );
        break;
      }
      case 'get_free_premium': {
        await handleGetFreePremium(chatId, messageId, callbackQueryId);
        break;
      }
      case 'on_map': {
        const [latitude, longitude]: [number, number] = callbackData.param;
        await bot.sendLocation(chatId, latitude, longitude, {
          reply_to_message_id: messageId,
        });
        break;
      }
      case 'subscribe_channel': {
        await handleSubscribeToChannel(chatId, messageId, callbackQueryId);
        break;
      }
      case 'invite_referral': {
        await handleInviteReferral(chatId, messageId, callbackQueryId);
        break;
      }
      case 'check_on_subscribe_channel': {
        await handleChekOnSubscribeToChannel(
          chatId,
          messageId,
          callbackQueryId,
        );
        break;
      }
      case 'faq_question_open': {
        await handleOpenQuestionFaq(
          chatId,
          messageId,
          callbackData,
          callbackQueryId,
        );
        break;
      }
      case 'remove_me': {
        await i18next.changeLanguage(language);
        await editMessage(
          chatId,
          messageId,
          t('Сообщение об удалении профиля'),
          callbackQueryId,
          {
            inline_keyboard: [
              [
                {
                  text: t('Все равно удалить'),
                  callback_data: JSON.stringify({ action: 'approve' }),
                },
              ],
              [
                {
                  text: t('В другой раз'),
                  callback_data: JSON.stringify({ action: 'reject' }),
                },
              ],
            ],
          },
        );
        break;
      }
      case 'approve': {
        await i18next.changeLanguage(language);
        await editMessage(
          chatId,
          messageId,
          t('Подтвердить удаление'),
          callbackQueryId,
          {
            inline_keyboard: [
              [
                {
                  text: t('Регистрация'),
                  callback_data: JSON.stringify({ action: 'registration' }),
                },
              ],
            ],
          },
        );
        await db.removeUser(chatId);
        break;
      }
      case 'reject': {
        await i18next.changeLanguage(language);
        await editMessage(
          chatId,
          messageId,
          t('Отклонить удаление'),
          callbackQueryId,
        );
        await sendMessage(
          chatId,
          t('Сообщение об отслеживании'),
          keyboards.Observe(),
        );
        break;
      }
      case 'back_observe': {
        await i18next.changeLanguage(language);
        await editMessage(
          chatId,
          messageId,
          t('Сообщение об отслеживании'),
          callbackQueryId,
          keyboards.Observe(),
        );
        break;
      }
      case 'back_premium': {
        await i18next.changeLanguage(language);
        await editMessage(
          chatId,
          messageId,
          t('Описание подписки'),
          callbackQueryId,
          keyboards.Premium(),
        );
        break;
      }
      case 'back_faq': {
        await i18next.changeLanguage(language);
        await editMessage(
          chatId,
          messageId,
          t('Сообщение для FAQ'),
          callbackQueryId,
          keyboards.Faq(),
        );
        break;
      }

      case 'wallet': {
        await i18next.changeLanguage(language);
        const isCompleted = await checkStatusOfDailyBonus(chatId);
        const message = await getDataWallet(chatId);
        await sendMessage(chatId, message, keyboards.Wallet(isCompleted));
        break;
      }
      case 'back_wallet': {
        await i18next.changeLanguage(language);
        const isCompleted = await checkStatusOfDailyBonus(chatId);
        const message = await getDataWallet(chatId);
        await editMessage(
          chatId,
          messageId,
          message,
          callbackQueryId,
          keyboards.Wallet(isCompleted),
        );
        break;
      }
      case 'daily_bonus': {
        await getDailyBonus(chatId, messageId, callbackQueryId);
        break;
      }
      case 'store': {
        await sendMessage(chatId, 'Товаров пока нет, но они скоро появятся.');
        break;
      }
      case 'wallet_top_up': {
        await handleBuyBonus(chatId, messageId, callbackQueryId);
        break;
      }
      case 'choose_rate': {
        await handleChooseRate(
          chatId,
          messageId,
          callbackData,
          callbackQueryId,
        );
        break;
      }
    }
  });
  await db.openConnection();
  for (const command of сommandHandlers) {
    await сommandsWrapper(command);
  }
};
