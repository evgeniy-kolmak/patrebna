import 'dotenv/config';
import db from 'config/db/databaseServise';
import parseKufar from 'parsers/kufar/tasks/parseKufar';
import { scheduleJob } from 'node-schedule';
import { type Error } from 'config/types';

void (async () => {
  scheduleJob('*/15 * * * *', async () => {
    try {
      await parseKufar((await db.getUserForParse()) as number[]);
    } catch (error) {
      const err = error as Error;
      if (
        err?.response?.body?.description ===
          'Forbidden: bot was blocked by the user' &&
        err?.response?.body?.error_code === 403
      ) {
        const url = err?.response?.request?.href;
        const match = url.match(/chat_id=(\d+)/);
        const chatId = match ? Number(match[1]) : null;
        if (chatId) {
          await db.removeUser(chatId);
        } else {
          console.log('Заблокированный пользователь не найден!');
        }
      } else {
        console.error(error);
      }
    }
  });
})();
