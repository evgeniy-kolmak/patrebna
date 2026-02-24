import 'dotenv/config';
import 'config/i18n/i18n';
import { t } from 'i18next';
import db from 'config/db/databaseServise';
import cache from 'config/redis/redisService';
import { scheduleJob } from 'node-schedule';
import {
  type IParserData,
  OperationType,
  StatusPremium,
  UserActions,
} from 'config/types';
import { getUserIds } from 'config/lib/helpers/getUserIds';
import { parseKufar } from 'parser/parseKufar';
import { updateUserCache } from 'config/lib/helpers/updateUserCache';
import { notificationOfExpiredPremium } from 'config/lib/helpers/notificationOfExpiredPremium';
import keyboards from 'bot/keyboards';
import { rebuildUserCache } from 'config/lib/helpers/rebuildUserCache';

void (async () => {
  await db.openConnection();
  void scheduleParsing(
    '2/30 * * * *',
    (user) => user.status === StatusPremium.BASE,
  );
  void scheduleParsing(
    '*/5 * * * *',
    (user) => user.status === StatusPremium.MAIN,
  );

  scheduleJob('0 0 * * *', async () => {
    await db.clearExpiredAdReferences();
    await db.applyPremiumTransition({
      findStatus: [StatusPremium.MAIN],
      dateField: 'downgrade_date',
      newStatus: StatusPremium.BASE,
      unsetField: 'downgrade_date',
    });
    const expiredUserIds = await db.applyPremiumTransition({
      findStatus: [StatusPremium.MAIN, StatusPremium.BASE],
      dateField: 'end_date',
      newStatus: StatusPremium.EXPIRED,
    });

    if (expiredUserIds.length) {
      for (const id of expiredUserIds) {
        await notificationOfExpiredPremium(id, t('Подписка уже закончилась'));
        await updateUserCache(id, { type: OperationType.DELETE });
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
    const isTrial = await db.hasUsedTrial(userId);
    await cache.sendNotificationToBot({
      userId,
      text: t('Сообщение для неактивных пользователей'),
      keyboard: keyboards.Trial(isTrial),
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
        const KEY = `user:${userId}`;
        const currentTTL = await cache.getTTL(KEY);
        const cacheUser = await cache.getCache(KEY);
        if (!cacheUser || currentTTL === -2) {
          const userDataFromDb = await rebuildUserCache(userId, 43200);
          return { userId, ...userDataFromDb };
        }
        const userDataFromCache: IParserData = JSON.parse(cacheUser);

        return { userId, ...userDataFromCache };
      }),
    );

    const filteredUsers = usersWithStatus.filter(filterFn);
    await parseKufar(filteredUsers);
  });
}
