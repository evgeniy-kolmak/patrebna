import 'dotenv/config';
import db from 'config/db/databaseServise';
import { scheduleJob } from 'node-schedule';
import parseKufar from 'parsers/kufar/tasks/parseKufar';
import { StatusPremium } from 'config/types';
import { getUserIds } from 'config/lib/helpers/getUserIds';
import { getUser } from 'config/lib/helpers/getUser';

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
    await db.expirePremium();
    const usersFromDatabase = await db.getUsersForParse();
    const inactiveUserIds = usersFromDatabase
      .filter((user) => !user.parser.kufar.dataParser)
      .map((user) => user.id);
    if (inactiveUserIds.length) {
      for (const id of inactiveUserIds) {
        await db.removeUser(id);
      }
    }
  });
})();

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
