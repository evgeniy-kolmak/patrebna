import { bot } from '../bot';
import db from '../../database';
import { IUser, ICollection } from '../../tasks/parseKufar';

export async function commandStop(
  users: ICollection<IUser>,
  usersIds: string[],
) {
  bot.onText(/\/stop/, async (ctx) => {
    users = await db.getUsers();
    usersIds = users ? Object.keys(users) : [];
    const { id } = ctx.chat;
    if (usersIds.includes(id.toString())) {
      await bot.sendMessage(
        id,
        '⚠️ Вы будете полностью удалены из рассылки! Для повторного взаимодействия, потребуется повторная регистрация.',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: ' ❌ Остановить бота', callback_data: 'removeUser' }],
              [
                {
                  text: ' 🚫 Остановить отлеживание объявлений Kufar',
                  callback_data: 'stopParseAds',
                },
              ],
              [{ text: ' ◀ Назад', callback_data: 'back' }],
            ],
          },
        },
      );
    } else {
      bot.sendMessage(
        id,
        '😟 Вы еще не зарегистрированы! Что бы начать взаимодействовать с ботом выберите команду <a>/start</a>',
        { parse_mode: 'HTML' },
      );
    }
  });
}
