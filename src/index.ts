import * as dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;
import { compareCollections, pause, getOldIdAds } from './helpers/utils';
import db, { ICollection, IAd } from './helpers/database';

void (async () => {
  await pause(500);

  const url = 'https://www.kufar.by/l/r~baran/mobilnye-telefony';
  let html = '';

  try {
    const { data } = await axios.get(url);
    html = data;
  } catch (error) {
    console.log(error);
  }

  const { document } = new JSDOM(html).window;
  const items = document.querySelectorAll('section');

  const newAds: ICollection<IAd> = {};

  items.forEach((node) => {
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
  });

  const saveAds = await db.getSavedAds();
  const newIds = compareCollections(saveAds, newAds);
  const collectionOldId = getOldIdAds(saveAds);

  for (const id of newIds) {
    await db.setNewAd(newAds[id]);
    await pause(500);
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
