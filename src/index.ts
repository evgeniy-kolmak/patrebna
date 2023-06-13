import schedule from 'node-schedule';
import axios from 'axios';
import { bot } from './helpers/telegram/bot';
import { compareCollections, pause } from './helpers/utils';
import db from './helpers/database';
import { parserAds } from './helpers/parser/parserAds';
import { commandStart } from './helpers/telegram/commands/start';
import { commandHelp } from './helpers/telegram/commands/help';
import { commandChangeurl } from './helpers/telegram/commands/changeurl';
import { commandStop } from './helpers/telegram/commands/stop';

void (async () => {
  await pause(1000);

  let users = await db.getUsers();
  let usersIds = users ? Object.keys(users) : [];

  await commandStart(users, usersIds);
  await commandChangeurl(users, usersIds);
  await commandStop(users, usersIds);
  commandHelp();

  schedule.scheduleJob('*/15 * * * *', async () => {
    console.log(new Date().toLocaleTimeString('ru-RU'));
    for (const id of usersIds) {
      const url = await db.getUserUrl(id);
      let html = '';
      if (url) {
        try {
          const { data } = await axios.get(url);
          html = data;
        } catch (error) {
          console.error(error);
        }

        const typeUrlParser = await db.getUserTypeParser(id);
        const parserData = parserAds(typeUrlParser, html);

        const saveAds = await db.getSavedAds(id);
        const newIds = compareCollections(saveAds, parserData);

        const statusCollectionAds = await db.isAdsEmpty(id);
        for (const newId of newIds) {
          const data = parserData[newId];
          await db.setNewAd(data, id);
          await pause(2500);
          if (statusCollectionAds) {
            bot.sendPhoto(id, `${data.img_url}`, {
              caption: `Появилось новое объявление: <b>${
                data.title
              }</b>, c ценой <b>${data.price}</b>.\n<i>${
                data?.description ?? 'Описание отсутствует к данному объявлению'
              }</i>\nВот ссылка: ${data.url}`,
              parse_mode: 'HTML',
            });
          }
        }

        console.log(`Добавлено новых объявлений ${newIds.length} в базу`);
      }
    }
  });
})();
