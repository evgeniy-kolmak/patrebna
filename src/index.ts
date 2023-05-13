import * as dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { bot } from './helpers/telegram/bot';
import { compareCollections, pause, getOldIdAds } from './helpers/utils';
import db from './helpers/database';
import { parserAds } from './helpers/parser/parserAds';
import { commandStart } from './helpers/telegram/commands/start';
import { commandChangeurl } from './helpers/telegram/commands/changeurl';
void (async () => {
  await pause(1000);

  let users = await db.getUsers();
  let usersIds = users ? Object.keys(users) : [];

  await commandStart(users, usersIds);
  await commandChangeurl();

  for (const id of usersIds) {
    const url = await db.getUserUrl(id);
    let html = '';

    try {
      const { data } = await axios.get(url);
      html = data;
    } catch (error) {
      console.log(error);
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
          caption: `Появился новый товар <b>${data.title}</b>, c ценой <b>${data.price}</b>\nвот ссылка: ${data.url}`,
          parse_mode: 'HTML',
        });
      }
    }

    console.log(`Добавлено новых объявлений ${newIds.length} в базу`);
  }

  //  const collectionOldId =  getOldIdAds(saveAds);

  // if (collectionOldId.length) {
  //   for (let i = 0; i > newIds.length; i++) {
  //     await db.removeOldAd(collectionOldId[i]);
  //     await pause(1000);
  //   }
  //   console.log(`Удалено старых объявлений ${newIds.length} из базы`);
  // }
})();
