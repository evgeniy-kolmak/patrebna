import { bot } from '../bot';
import axios from 'axios';
import db from '../../database';
import { IUser, ICollection } from '../../database';
import { typeUrlParser } from '../../typeUrlParser';
import { errorMsg } from '../../errorMessage';

export async function commandChangeurl(
  users: ICollection<IUser>,
  usersIds: string[],
): Promise<void> {
  bot.onText(/\/changeurl/, async (ctx) => {
    users = await db.getUsers();
    usersIds = users ? Object.keys(users) : [];

    const { id } = ctx.chat;
    if (usersIds.includes(id.toString())) {
      bot.sendMessage(id, '💬 Хотите изменить ссылку?', {
        reply_markup: {
          inline_keyboard: [
            [{ text: ' 👌 Да, хочу!', callback_data: 'change' }],
            [{ text: ' ◀ Назад', callback_data: 'back' }],
          ],
        },
      });

      bot.on('callback_query', async (query) => {
        const msgKeyboard = ctx.message_id + 1;
        switch (query.data) {
          case 'change': {
            bot.deleteMessage(id, msgKeyboard);
            const promptLink = await bot.sendMessage(
              id,
              '⚙️ Укажите ссылку с параметрами для отслеживания типа - https://kufar.by/l/город/товар/',
              {
                reply_markup: {
                  force_reply: true,
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
              }
            });
            break;
          }
          case 'back': {
            bot.deleteMessage(id, msgKeyboard);
            bot.sendMessage(id, 'text');
          }
        }
      });
    } else {
      bot.sendMessage(
        id,
        '😟 Вы еще не зарегистрированы! Что бы начать взаимодействовать с ботом выберите команду <a>/start</a>',
        { parse_mode: 'HTML' },
      );
    }
  });
}
