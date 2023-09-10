import { bot } from '../bot';
import db from '../../database';
import { IUser, ICollection } from '../../tasks/parseKufar';

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
    await bot.sendMessage(
      id,
      "Доброго времени суток!\n<b>Patrebna</b> - это бот для отслеживания новых объявлений на площадке 'Kufar', а так же мониторинга изменений в статусе посылок 'Еврочта' по их трек-номерам. Наша основная цель - предоставлять вам актуальную информацию и помогать быть в курсе всех обновлений.",
      { parse_mode: 'HTML' },
    );
    const isLink = !(await db.getUserUrl(id.toString()));
    bot.sendMessage(
      id,
      '🔎 Отлично, давайте начнем. Что бы вы хотели отслеживать?',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `${
                  isLink
                    ? '📢 Добавить ссылку Kufar'
                    : '🔄 Изменить ссылку Kufar'
                }`,
                callback_data: `${isLink ? 'addLink' : 'changeLink'}`,
              },
            ],
            [
              {
                text: '📍 Добавить трек-номер Европочта',
                callback_data: 'addTrack',
              },
            ],
          ],
        },
      },
    );
  });
}
