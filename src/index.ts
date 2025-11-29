import 'dotenv/config';
import 'config/i18n/i18n';
import { t } from 'i18next';
import db from 'config/db/databaseServise';
import cache from 'config/redis/redisService';
import { scheduleJob } from 'node-schedule';
import { StatusPremium, UserActions } from 'config/types';
import { getUserIds } from 'config/lib/helpers/getUserIds';
import { getUser } from 'config/lib/helpers/getUser';
import { parseKufar } from 'parser/parseKufar';
import { notificationOfExpiredPremium } from 'config/lib/helpers/notificationOfExpiredPremium';
import keyboard from 'bot/keyboard';

void (async () => {
  await db.openConnection();
  void scheduleParsing(
    '2/30 * * * *',
    (user) => user.status !== StatusPremium.ACTIVE,
  );
  void scheduleParsing(
    '*/5 * * * *',
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
  remove: async (userId: number) => {
    await db.removeUser(userId);
  },
  notification: async (userId: number) => {
    await cache.sendNotificationToBot({
      userId,
      text: t('Сообщение для неактивных пользователей'),
      keyboard: keyboard.Observe(),
    });
  },
};

async function handleInactiveUsers(action: UserActions): Promise<void> {
  const usersFromDatabase = await db.getUsersForParse();
  const inactiveUserIds = (
    await Promise.all(
      usersFromDatabase
        .filter((user) => !user.parser?.kufar?.dataParser)
        .map(async (user) => {
          const dataPremium = await db.getDataPremium(user.id);
          return dataPremium?.end_date ? null : user.id;
        }),
    )
  ).filter((id): id is number => id !== null);

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

    const filteredUsers = usersWithStatus.filter(filterFn);
    await parseKufar(filteredUsers);
  });
}
