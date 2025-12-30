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
import { handleBuyPremiumWithBonuses } from 'bot/handlers/callbacks/buyPremiumWithBonuses';
import { handlePlayGame } from 'bot/handlers/callbacks/playGame';
import { handleChoiceGame } from 'bot/handlers/callbacks/choiceGame';
import { checkStatusOfDailyActivities } from 'config/lib/helpers/checkStatusOfDailyActivities';
import { getDataWallet } from 'config/lib/helpers/getDataWallet';
import { editMessage } from 'config/lib/helpers/editMessage';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import { сommandsWrapper } from 'config/lib/helpers/сommandsWrapper';
import { сommandHandlers } from 'constants/сommandHandlers';
import { tariffData } from 'constants/tariffs';
import cache from 'config/redis/redisService';

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
                  callback_data: JSON.stringify({
                    action: 'approve_remove_me',
                  }),
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
      case 'approve_remove_me': {
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
      case 'wallet': {
        await i18next.changeLanguage(language);
        const key = `dailyBonus:${chatId}`;
        const isCompleted = await checkStatusOfDailyActivities(key);
        const message = await getDataWallet(t('Сообщение о кошельке'), chatId);
        await sendMessage(chatId, message, keyboards.Wallet(isCompleted));
        break;
      }
      case 'back_wallet': {
        await i18next.changeLanguage(language);
        const key = `dailyBonus:${chatId}`;
        const isCompleted = await checkStatusOfDailyActivities(key);
        const message = await getDataWallet(t('Сообщение о кошельке'), chatId);
        await editMessage(
          chatId,
          messageId,
          message,
          callbackQueryId,
          keyboards.Wallet(isCompleted),
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
      case 'back_store': {
        await i18next.changeLanguage(language);
        const message = await getDataWallet(t('Сообщение о магазине'), chatId);
        await editMessage(
          chatId,
          messageId,
          message,
          callbackQueryId,
          keyboards.Store(),
        );
        break;
      }
      case 'daily_bonus': {
        await getDailyBonus(chatId, messageId, callbackQueryId);
        break;
      }
      case 'play_game': {
        await handlePlayGame(chatId, messageId, callbackQueryId);
        break;
      }

      case 'choice_game': {
        await handleChoiceGame(
          chatId,
          messageId,
          callbackQueryId,
          callbackData,
        );
        break;
      }
      case 'store': {
        await i18next.changeLanguage(language);
        const message = await getDataWallet(t('Сообщение о магазине'), chatId);
        await sendMessage(chatId, message, keyboards.Store());
        break;
      }
      case 'buy_premium_with_bonuses': {
        await handleBuyPremiumWithBonuses(chatId, messageId, callbackQueryId);
        break;
      }
      case 'buy_try_to_play_game': {
        await i18next.changeLanguage(language);
        const keyboard = {
          inline_keyboard: [
            [
              {
                text: `✅ ${t('Подтвердить')}`,
                callback_data: JSON.stringify({
                  action: 'approve_try_to_play',
                }),
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
        await editMessage(
          chatId,
          messageId,
          t('Сообщения при покупке попытки в игре'),
          callbackQueryId,
          keyboard,
        );
        break;
      }
      case 'payment_with_bonuses': {
        await i18next.changeLanguage(language);
        const order = tariffData[callbackData.param];
        const newMessage = `<b>${t(order.name)}</b>\n${t('Подписка')} на <b>${order.quantityOfDays} ${t('Дней')}</b> - <b>${order.amount / 10}</b> ${t('Бонусов')}`;
        await editMessage(chatId, messageId, newMessage, callbackQueryId, {
          inline_keyboard: [
            [
              {
                text: `✅ ${t('Подтвердить')}`,
                callback_data: JSON.stringify({
                  action: 'approve_payment_with_bonuses',
                  param: callbackData.param,
                }),
              },
            ],
            [
              {
                text: t('Назад'),
                callback_data: JSON.stringify({
                  action: 'buy_premium_with_bonuses',
                }),
              },
            ],
          ],
        });
        break;
      }
      case 'approve_payment_with_bonuses': {
        await i18next.changeLanguage(language);
        const wallet = await db.getWallet(chatId);
        const { quantityOfDays, amount } = tariffData[callbackData.param];
        if (!wallet || wallet < amount / 10) {
          await editMessage(
            chatId,
            messageId,
            t('Недостаточно бонусов'),
            callbackQueryId,
            keyboards.notEnoughBonusesKeyboard(),
          );
          break;
        }
        await db.decrementWallet(chatId, amount / 10);
        await db.grantPremium(chatId, quantityOfDays);
        await editMessage(
          chatId,
          messageId,
          t('Успешная покупка за бонусы'),
          callbackQueryId,
        );
        break;
      }
      case 'approve_try_to_play': {
        await i18next.changeLanguage(language);
        const isCompleted = await checkStatusOfDailyActivities(
          `dailyGame:${chatId}`,
        );
        if (!isCompleted) {
          await editMessage(
            chatId,
            messageId,
            t('Доступна бесплатная попытка в игре'),
            callbackQueryId,
            keyboards.Game(),
          );
          break;
        }
        const wallet = await db.getWallet(chatId);
        if (!wallet || wallet < 5) {
          await editMessage(
            chatId,
            messageId,
            t('Недостаточно бонусов'),
            callbackQueryId,
            keyboards.notEnoughBonusesKeyboard(),
          );
          break;
        }
        await db.decrementWallet(chatId, 5);
        await cache.removeCache(`dailyGame:${chatId}`);
        await sendMessage(chatId, t('Сообщение об успехе'));
        await editMessage(
          chatId,
          messageId,
          t('Правила игры'),
          callbackQueryId,
          keyboards.Game(),
        );
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
