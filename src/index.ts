import 'dotenv/config';
import db from 'config/db/databaseServise';
import { scheduleJob } from 'node-schedule';
import parseKufar from 'parsers/kufar/tasks/parseKufar';

void (async () => {
  scheduleJob('*/15 * * * *', async () => {
    await parseKufar();
  });
  scheduleJob('0 0 * * *', async () => {
    await db.clearExpiredAdReferences();
  });
})();
