import { bot } from './telegram/bot';
import axios from 'axios';
import db from './database';
import { IUser } from './database';
import { typeUrlParser } from './typeUrlParser';
import { errorMsg } from './errorMessage';

export default () =>
  bot.on('callback_query', async (query) => {
    const { data, from } = query;
    const id = from.id;
    switch (data) {
      case 'change': {
        const promptLink = await bot.sendMessage(
          from.id,
          '⚙️ Укажите ссылку с параметрами для отслеживания',
          {
            reply_markup: {
              force_reply: true,
              input_field_placeholder: 'https://kufar.by/l/город/товар/',
            },
          },
        );

        const { message_id } = promptLink;
        bot.onReplyToMessage(id, message_id, async (message) => {
          const { entities, text, from } = message;
          if (entities?.[0].type === 'url') {
            try {
              if (text) {
                await db.removeAds(id.toString());
                await axios.get(text);
                await typeUrlParser(text, from as IUser);
                await db.setUrlUser(text, from as IUser);
                bot.sendMessage(
                  id,
                  '🎯 Все прошло успешно, ожидайте обновлений!',
                );
              }
            } catch (error) {
              errorMsg(id, '/changeurl');
            }
          } else {
            errorMsg(id, '/changeurl');
          }
        });
        break;
      }
      case 'remove': {
        await db.removeUser(id.toString());
        await bot.sendMessage(
          id,
          '👌 Удаление прошло успешно! Будем ждать вас снова.',
        );
        break;
      }
      case 'back': {
        bot.sendMessage(
          id,
          '📑 Выберите команду для дальнейшего взаимодействия с ботом. Для  этого нажмите на кнопку <b>Меню</b>.\nЕсли регистрация прошла успешно, просто ожидайте обновлений.',
          { parse_mode: 'HTML' },
        );
        break;
      }
    }
  });
