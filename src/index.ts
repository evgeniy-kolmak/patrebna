import schedule from 'node-schedule';
import { pause } from './helpers/utils';
import db from './helpers/database';
import { commandStart } from './helpers/telegram/commands/start';
import { commandHelp } from './helpers/telegram/commands/help';
import { commandChangeurl } from './helpers/telegram/commands/change_url';
import { commandTrackPackages } from './helpers/telegram/commands/track_packages';
import { commandStop } from './helpers/telegram/commands/stop';

import parseKufar from './helpers/tasks/parseKufar';
import trackEvropochta from './helpers/tasks/trackEvropochta';

void (async () => {
  await pause(1000);

  let users = await db.getUsers();
  let usersIds = users ? Object.keys(users) : [];

  await commandStart(users, usersIds);
  await commandChangeurl(users, usersIds);
  await commandTrackPackages(users, usersIds);
  await commandStop(users, usersIds);
  commandHelp();

  schedule.scheduleJob('*/15 * * * *', async () => {
    try {
      await parseKufar(usersIds);
    } catch (error) {
      console.error(error);
    }
  });

  schedule.scheduleJob('0 */1 * * *', async () => {
    try {
      await trackEvropochta(usersIds);
    } catch (error) {
      console.error(error);
    }
  });
})();
