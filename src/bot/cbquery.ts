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
import { editMessage } from 'config/lib/helpers/editMessage';

export default (): void => {
  bot.on('callback_query', async (query): Promise<void> => {
    const { data, from, message } = query;
    const callbackData: ICallbackData = JSON.parse(data ?? '{}');
    const chatId = from.id;
    const messageId = message?.message_id;
    const language = await getUserLanguage(chatId);
    switch (callbackData.action) {
      case 'registration': {
        await handleRegistration(chatId, from, messageId);
        break;
      }
      case 'change_language': {
        await handleChangeLanguage(chatId, message);
        break;
      }
      case 'kufar': {
        await handleObserveKufar(chatId, messageId);
        break;
      }
      case 'add_link_kufar': {
        await handleAddLinkKufar(chatId, messageId, callbackData);
        break;
      }
      case 'change_status_link_kufar': {
        await handleChangeUrlStatus(chatId, messageId, callbackData);
        break;
      }

      case 'remove_link_kufar': {
        await i18next.changeLanguage(language);
        const urlId: number = callbackData.param;
        await db.removeUrlKufar(chatId, urlId);
        await handleObserveKufar(chatId, messageId);
        await bot.sendMessage(chatId, t('Ссылка удалена'), {
          parse_mode: 'HTML',
        });
        break;
      }
      case 'wrap_link': {
        await handleWrapperForLink(chatId, messageId, callbackData);
        break;
      }
      case 'buy_premium': {
        await handleBuyPremium(chatId, messageId);
        break;
      }
      case 'choose_tariff': {
        await handleChooseTariff(chatId, messageId, callbackData);
        break;
      }
      case 'get_free_premium': {
        await handleGetFreePremium(chatId, messageId);
        break;
      }
      case 'remove_me': {
        await i18next.changeLanguage(language);
        await editMessage(
          chatId,
          messageId,
          t('Сообщение об удалении профиля'),
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
        await editMessage(chatId, messageId, t('Подтвердить удаление'), {
          inline_keyboard: [
            [
              {
                text: t('Регистрация'),
                callback_data: JSON.stringify({ action: 'registration' }),
              },
            ],
          ],
        });
        await db.removeUser(chatId);
        break;
      }
      case 'reject': {
        await i18next.changeLanguage(language);
        await editMessage(
          chatId,
          messageId,
          t('Отклонить удаление'),
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
          keyboard.Premium(),
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
