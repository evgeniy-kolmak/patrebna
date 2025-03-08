import 'dotenv/config';
import db from 'config/db/databaseServise';
import Kufar from 'parsers/kufar/tasks/Kufar';
import { scheduleJob } from 'node-schedule';
import { type ErrorTelegram } from 'config/types';

void (async () => {
  scheduleJob('*/15 * * * *', async () => {
    await taskKufar(await db.getUsersForParse());
  });
  scheduleJob('0 0 * * *', async () => {
    const inactiveUsers = await db.getInactiveUsers();
    if (inactiveUsers.length) {
      for (const id of await db.getInactiveUsers()) {
        await db.removeUser(id);
      }
    }
    await db.clearExpiredAdReferences();
  });
})();

async function taskKufar(users: number[]): Promise<void> {
  try {
    await Kufar(users);
  } catch (error) {
    const err = error as ErrorTelegram;
    if (err?.response?.body?.error_code === 403) {
      const url = err?.response?.request?.href;
      const match = url?.match(/chat_id=(\d+)/);
      const chatId = match ? Number(match[1]) : null;
      if (chatId) {
        await db.removeUser(chatId);
        const indexOfUser = users.findIndex((user) => chatId === user);
        if (indexOfUser !== users.length - 1) {
          await taskKufar(users.slice(indexOfUser + 1));
        }
        console.log('Заблокированный пользователь был удален!');
      } else {
        console.log('Заблокированный пользователь не найден!');
      }
    } else {
      console.error(error);
    }
  }
}
