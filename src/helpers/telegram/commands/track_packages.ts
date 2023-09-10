import { bot } from '../bot';
import db from '../../database';
import { IUser, ICollection } from '../../tasks/parseKufar';

export async function commandTrackPackages(
  users: ICollection<IUser>,
  usersIds: string[],
): Promise<void> {
  bot.onText(/\/track_packages/, async (ctx) => {
    users = await db.getUsers();
    usersIds = users ? Object.keys(users) : [];
    const { id } = ctx.chat;
    if (usersIds.includes(id.toString())) {
      await bot.sendMessage(
        id,
        'Теперь вы можете отслеживать местоположение вашей посылки в режиме реального времени, просто введя трек-номер. Наш бот автоматически отправит вам уведомление, как только произойдут изменения в ее расположении во время доставки.',
      );

      await bot.sendMessage(id, '✅ Отлично, давайте начнем отслеживать.', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: ' 📍 Добавить трек-номер Евпрочта',
                callback_data: 'addTrack',
              },
            ],
            [{ text: ' ◀ Назад', callback_data: 'back' }],
          ],
        },
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
