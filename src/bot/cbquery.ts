/* eslint-disable @typescript-eslint/naming-convention */
import { bot } from 'bot';
import keyboard from './keyboard';
import start from 'bot/commands/start';
import profile from 'bot/commands/profile';
import language from 'bot/commands/language';
import observe from 'bot/commands/observe';
import i18next, { t } from 'i18next';
import db from 'config/db/databaseServise';
import { eventMessage } from 'config/lib/helpers/eventMessage';
import { type IUser, Languages } from 'config/types';

export default (): void => {
  bot.on('callback_query', async (query): Promise<void> => {
    const { data, from, message } = query;
    const chatID = from.id;
    const messageID = message?.message_id;
    switch (data) {
      case 'registration': {
        try {
          const { username, first_name, last_name } = from;
          const profile: IUser = {
            username,
            first_name,
            last_name,
            premium: 0,
          };
          await db.setUser(profile, chatID);
          await bot.editMessageText(t('Успех регистрации'), {
            chat_id: chatID,
            message_id: messageID,
            reply_markup: await keyboard.Profile(chatID),
          });
        } catch (error) {
          console.error(error);
          await eventMessage(
            chatID,
            t('Ошибка регистрации'),
            keyboard.Button(t('Регистрация'), 'registration'),
          );
          await eventMessage(chatID, t('Помощь'), keyboard.Main());
        }
        break;
      }
      case 'change_language': {
        await i18next.changeLanguage(
          i18next.language === Languages.Belarusian
            ? Languages.Russian
            : Languages.Belarusian,
        );

        await bot.sendMessage(chatID, t('Язык был изменен'), {
          parse_mode: 'HTML',
          reply_markup: keyboard.Main(),
        });
        await bot.editMessageText(t('Переключить язык приложения'), {
          chat_id: chatID,
          message_id: messageID,
          reply_markup: keyboard.Button(t('Сменить язык'), 'change_language'),
        });
        break;
      }

      case 'remove_me': {
        await bot.editMessageText(t('Сообщение об удалении профиля'), {
          chat_id: chatID,
          message_id: messageID,
          parse_mode: 'HTML',
          reply_markup: keyboard.SomeButtons([
            [t('Все равно удалить'), 'approve'],
            [t('В другой раз'), 'reject'],
          ]),
        });
        break;
      }
      case 'approve': {
        await bot.editMessageText(t('Подтвердить удаление'), {
          chat_id: chatID,
          message_id: messageID,
          parse_mode: 'HTML',
          reply_markup: keyboard.Button(t('Регистрация'), 'registration'),
        });
        await db.removeUser(chatID);
        break;
      }
      case 'reject': {
        await bot.editMessageText(t('Отклонить удаление'), {
          chat_id: chatID,
          message_id: messageID,
          parse_mode: 'HTML',
          reply_markup: await keyboard.Profile(chatID),
        });
        break;
      }
      case 'back': {
        await bot.sendMessage(chatID, t('Действие отменено'), {
          reply_markup: keyboard.Main(),
        });

        await bot.sendMessage(chatID, t('На главную'));

        await bot.sendMessage(chatID, t('Сообщение об отслеживании'), {
          reply_markup: keyboard.Observe(),
        });
        break;
      }
      case 'back_observe': {
        await bot.editMessageText(t('Сообщение об отслеживании'), {
          chat_id: chatID,
          message_id: messageID,
          parse_mode: 'HTML',
          reply_markup: keyboard.Observe(),
        });
        await bot.sendMessage(chatID, t('Действие отменено'), {
          reply_markup: keyboard.Main(),
        });
        break;
      }
      case 'kufar': {
        const dataParser = await db.getDataParser(chatID);
        await bot.editMessageText(t('Текст для Kufar'), {
          chat_id: chatID,
          message_id: messageID,
          parse_mode: 'HTML',
          reply_markup: keyboard.SomeButtons([
            [
              `${dataParser?.url ? t('Изменить ссылку') : t('Добавить ссылку')}`,
              'add_link_kufar',
            ],
            [t('Назад'), 'back_observe'],
          ]),
        });
        break;
      }
      case 'add_link_kufar': {
        await bot.editMessageText(t('Текст для Kufar при добавлении ссылки'), {
          chat_id: chatID,
          message_id: messageID,
          parse_mode: 'HTML',
        });

        const promptKufar = await bot.sendMessage(
          chatID,
          t('Укажите ссылку для Kufar'),
          {
            reply_markup: {
              force_reply: true,
              input_field_placeholder: t('Плейсхолдер ссылки Kufar'),
            },
          },
        );

        const { message_id } = promptKufar;
        bot.onReplyToMessage(chatID, message_id, (message) => {
          const { text } = message;
          void (async () => {
            if (text) {
              const data = await db.setUrlKufar(text, chatID);
              if (data instanceof Error) {
                await eventMessage(
                  chatID,
                  t('Ошибка добавления ссылки'),
                  keyboard.SomeButtons([
                    [t('Изменить ссылку'), 'add_link_kufar'],
                    [t('Назад'), 'back_observe'],
                  ]),
                );
              } else {
                await eventMessage(
                  chatID,
                  t('Сообщение об успехе'),
                  keyboard.Main(),
                );
              }
            }
          })();
        });
        break;
      }
    }
  });
  start();
  profile();
  language();
  observe();
};
