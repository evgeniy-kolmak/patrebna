import { bot } from '../bot';
import axios from 'axios';
import db from '../../database';
import { typeUrlParser } from '../../typeUrlParser';
import { ICollection, IUser } from '../../database';
import { errorMsg } from '../../errorMessage';

export async function commandStart(
  users: ICollection<IUser>,
  usersIds: string[],
) {
  bot.onText(/\/start/, async (ctx) => {
    users = await db.getUsers();
    usersIds = users ? Object.keys(users) : [];
    const { from } = ctx;
    await db.setUserListener(from as IUser);
    const { id } = ctx.chat;
    if (!usersIds.includes(id.toString())) {
      bot.sendMessage(
        id,
        '📢 Что бы начать, просто добавь ссылку для отслеживания.',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: ' 🔗 Добавить ссылку', callback_data: 'add' }],
            ],
          },
        },
      );

      bot.on('callback_query', async (query) => {
        const msgKeyboard = ctx.message_id + 1;
        bot.deleteMessage(id, msgKeyboard);
        const promptLink = await bot.sendMessage(
          id,
          '⚙️ Укажите ссылку с параметрами для отслеживания типа',
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
      });
    } else {
      bot.sendMessage(
        id,
        '😊 Вы уже зарегестрирвоаны! Что бы изменить ссылку используйте команду <a>/changeurl</a>',
        { parse_mode: 'HTML' },
      );
    }
  });
}
