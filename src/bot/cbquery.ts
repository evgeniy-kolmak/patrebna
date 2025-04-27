/* eslint-disable @typescript-eslint/naming-convention */
import { bot } from 'bot';
import i18next, { t } from 'i18next';
import db from 'config/db/databaseServise';
import keyboard from 'bot/keyboard';
import start from 'bot/commands/start';
import help from 'bot/commands/help';
import profile from 'bot/commands/profile';
import observe from 'bot/commands/observe';
import premium from 'bot/commands/premium';
import language from 'bot/commands/language';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
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
import { editMessage } from 'config/lib/helpers/editMessage';

export default (): void => {
  bot.on('callback_query', async (query): Promise<void> => {
    const { data, from, id: callbackQueryId, message } = query;
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
    const chatId = from.id;
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
        await handleChangeLanguage(chatId, message);
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
        await bot.sendMessage(chatId, t('Ссылка удалена'), {
          parse_mode: 'HTML',
        });
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
          await keyboard.Profile(),
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
          keyboard.Observe(),
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
          keyboard.Premium(),
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
          keyboard.Faq(),
        );
        break;
      }
    }
  });
  start();
  help();
  profile();
  observe();
  premium();
  language();
};
