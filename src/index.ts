import * as dotenv from 'dotenv';
dotenv.config();
import { conf } from './config';
import axios from 'axios';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

import TelegramBot from 'node-telegram-bot-api';
const TOKEN = conf.tokenBot ?? '';
const bot = new TelegramBot(TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});
import { compareCollections, pause, getOldIdAds } from './helpers/utils';
import db, { ICollection, IAd, IUser } from './helpers/database';

void (async () => {
  await pause(1000);

  let users = await db.getUsers();
  let usersIds = users ? Object.keys(users) : [];

  bot.on('message', async (msg) => {
    users = await db.getUsers();
    usersIds = users ? Object.keys(users) : [];
    const { id } = msg.chat;
    const { from } = msg;
    await db.setUserListener(from as IUser);
    bot.sendMessage(id, 'Вы были добавлены в рассылку');
  });
  console.log(usersIds);

  function notifyUser(data: IAd): void {
    const text = `Появился новый товар вот ссылка ${data.url}`;
    for (const id of usersIds) {
      bot.sendMessage(id, text);
    }
  }

  db.updateAds(notifyUser);

  const url = 'https://www.kufar.by/l/r~baran/mobilnye-telefony';
  let html = '';

  try {
    const { data } = await axios.get(url);
    html = data;
  } catch (error) {
    console.log(error);
  }

  const { document } = new JSDOM(html).window;
  const items = document.querySelectorAll(
    '[data-name=listings] > div > div > section',
  );

  const newAds: ICollection<IAd> = {};

  items.forEach((node) => {
    const isNotCompanyAd = node.querySelector(
      'a div ~ div h3 ~ div > div > div',
    )?.textContent;

    if (!isNotCompanyAd) {
      const urlItem = node.querySelector('a')?.getAttribute('href') ?? '';
      const url = new URL(urlItem);
      const itemId = url.pathname.split('/')[2];
      newAds[itemId] = {
        id: itemId,
        title: node.querySelector('a > div > h3')?.textContent?.trim() ?? '',
        price: node.querySelector('a > div ~ div > div')?.textContent ?? '',
        url: urlItem,
        createAd: new Date().toLocaleDateString('ru-RU'),
      };
    }
  });

  const saveAds = await db.getSavedAds();
  const newIds = compareCollections(saveAds, newAds);
  const collectionOldId = getOldIdAds(saveAds);

  for (const id of newIds) {
    await db.setNewAd(newAds[id]);
    await pause(2500);
  }

  if (collectionOldId.length) {
    for (let i = 0; i > newIds.length; i++) {
      await db.removeOldAd(collectionOldId[i]);
      await pause(1000);
    }
    console.log(`Удалено старых объявлений ${newIds.length} из базы`);
  }

  console.log(`Добавлено новых объявлений ${newIds.length} в базу`);
})();
