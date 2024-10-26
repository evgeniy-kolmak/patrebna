import 'dotenv/config';
import db from 'config/db/databaseServise';
import parseKufar from 'parsers/kufar/tasks/parseKufar';
import { scheduleJob } from 'node-schedule';

void (async () => {
  scheduleJob('*/15 * * * *', async () => {
    try {
      await parseKufar((await db.getUserForParse()) as number[]);
    } catch (error) {
      console.error(error);
    }
  });
})();
