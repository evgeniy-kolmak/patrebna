import 'dotenv/config';
import db from 'config/db/databaseServise';
import parseKufar from 'parsers/kufar/tasks/parseKufar';
import { scheduleJob } from 'node-schedule';

void (async () => {
  const users: number[] = await db.getUserForParse();

  scheduleJob('*/15 4-19 * *', async () => {
    try {
      await parseKufar(users);
    } catch (error) {
      console.error(error);
    }
  });
})();
