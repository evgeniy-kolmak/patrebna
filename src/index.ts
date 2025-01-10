import 'dotenv/config';
import db from 'config/db/databaseServise';
import { scheduleJob } from 'node-schedule';
import parseKufar from 'parsers/kufar/tasks/parseKufar';
import { StatusPremium } from 'config/types';
import { getUsers } from 'config/lib/helpers/getUsers';

void (async () => {
  scheduleParsing(
    '3-59/24 * * * *',
    ({ status }) => status !== StatusPremium.ACTIVE,
  );
  scheduleParsing(
    '6-59/6 * * * *',
    ({ status }) => status === StatusPremium.ACTIVE,
  );
  scheduleJob('0 0 * * *', async () => {
    await db.clearExpiredAdReferences();
  });
})();

function scheduleParsing(
  cronTime: string,
  filterFn: (user: any) => boolean,
): void {
  scheduleJob(cronTime, async () => {
    const users = await getUsers();
    const filteredUsers = Object.fromEntries(
      Object.entries(users).filter(([_, value]) => filterFn(value)),
    );
    await parseKufar(filteredUsers);
  });
}
