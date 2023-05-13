import { bot } from '../bot';
import axios from 'axios';
import db from '../../database';
import { IUser } from '../../database';
import { typeUrlParser } from '../../typeUrlParser';

export async function commandChangeurl(): Promise<void> {
  bot.onText(/\/changeurl/, (ctx1) => {
    const { id } = ctx1.chat;

    bot.sendMessage(id, '💬 Хотите изменить ссылку?', {
      reply_markup: {
        inline_keyboard: [[{ text: ' 👌 Да, хочу!', callback_data: 'reply' }]],
      },
    });

    bot.on('callback_query', async (query) => {
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
            console.log(error);
          }
        }
      });
    });
  });
}
