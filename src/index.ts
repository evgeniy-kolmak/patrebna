import 'dotenv/config';
import { t } from 'i18next';
import db from 'config/db/databaseServise';
import { scheduleJob } from 'node-schedule';
import parseKufar from 'parsers/kufar/tasks/parseKufar';
import { type IErrorTelegram, StatusPremium, UserActions } from 'config/types';
import { getUserIds } from 'config/lib/helpers/getUserIds';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import { getUser } from 'config/lib/helpers/getUser';
import { notificationOfExpiredPremium } from 'config/lib/helpers/notificationOfExpiredPremium';

import keyboard from 'bot/keyboard';

void (async () => {
  void scheduleParsing(
    '3-59/24 * * * *',
    (user) => user.status !== StatusPremium.ACTIVE,
  );
  void scheduleParsing(
    '6-59/6 * * * *',
    (user) => user.status === StatusPremium.ACTIVE,
  );

  scheduleJob('0 0 * * *', async () => {
    await db.clearExpiredAdReferences();
    const expiredUserIds = await db.expirePremium();
    if (expiredUserIds.length) {
      for (const id of expiredUserIds) {
        await notificationOfExpiredPremium(id, t('Подписка уже закончилась'));
      }
    }
    const expiredUserSoonIds = await db.expirePremiumSoon();
    if (expiredUserSoonIds.length) {
      for (const id of expiredUserSoonIds) {
        await notificationOfExpiredPremium(id, t('Подписка скоро закончится'));
      }
    }
  });
  scheduleJob('0 0 * * 0', async () => {
    await handleInactiveUsers(UserActions.REMOVE);
  });

  scheduleJob('12 */8 * * *', async () => {
    await handleInactiveUsers(UserActions.NOTIFACTION);
  });
})();

const userActions = {
  remove: async (id: number) => {
    await db.removeUser(id);
  },
  notification: async (id: number) => {
    try {
      await sendMessage(
        id,
        t('Сообщение для неактивных пользователей'),
        keyboard.Observe(),
      );
    } catch (error) {
      const err = error as IErrorTelegram;
      const { error_code } = err.response.body;
      if (error_code === 403) {
        await db.removeUser(id);
        console.error('Заблокированный пользователь был удален!');
      } else {
        console.log('Ошибка при отправке уведомления:', error);
      }
    }
  },
};

async function handleInactiveUsers(action: UserActions): Promise<void> {
  const usersFromDatabase = await db.getUsersForParse();
  const inactiveUserIds = usersFromDatabase
    .filter((user) => !user.parser?.kufar?.dataParser)
    .map((user) => user.id);

  if (inactiveUserIds.length) {
    for (const id of inactiveUserIds) {
      await userActions[action](id);
    }
  }
}

async function scheduleParsing(
  cronTime: string,
  filterFn: (user: { userId: number; status: StatusPremium }) => boolean,
): Promise<void> {
  scheduleJob(cronTime, async () => {
    const userIds = await getUserIds();

    const usersWithStatus = await Promise.all(
      userIds.map(async (userId) => {
        const user = await getUser(userId);
        return { userId, ...user };
      }),
    );

    await parseKufar(usersWithStatus.filter(filterFn));
  });
}
