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
  process.env.NTBA_FIX_350 = '1';

  bot.onText(/\/start/, async (ctx) => {
    users = await db.getUsers();
    usersIds = users ? Object.keys(users) : [];
    const { from } = ctx;
    await db.setUserListener(from as IUser);
    const { id } = ctx.chat;
    bot.sendMessage(
      id,
      '📢 Что бы начать, просто добавь ссылку для отслеживания.',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: ' 🔗 Добавить ссылку', callback_data: 'reply' }],
          ],
        },
      },
    );
    bot.on('callback_query', async (query) => {
      const promptLink = await bot.sendMessage(
        id,
        '⚙️ Укажите ссылку с параметрами для отслеживания типа - https://kufar.by/l/город/товар/',
        {
          reply_markup: {
            force_reply: true,
          },
        },
      );
      const { message_id } = promptLink;
      bot.onReplyToMessage(id, message_id, async (message) => {
        const { entities, text, from } = message;
        if (entities?.[0].type === 'url') {
          try {
            if (text) {
              await axios.get(text);
              db.setUrlUser(text, from as IUser);
              bot.sendMessage(
                id,
                '🎯 Все прошло успешно, ожидайте обновлений!',
              );
            }
          } catch (error) {
            console.log(error);
          }
        }
      });
    });
  });

  await pause(1000);

  let users = await db.getUsers();
  let usersIds = users ? Object.keys(users) : [];

  for (const id of usersIds) {
    const url = await db.getUserUrl(id);
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
        const { origin, pathname } = url;
        const itemId = url.pathname.split('/')[2];

        newAds[itemId] = {
          img_url:
            node
              .querySelector(`a > div > div > div > div > div > img`)
              ?.getAttribute('data-src') ?? 'dist/images/no-photo.png',
          id: itemId,
          title: node.querySelector('a > div > h3')?.textContent?.trim() ?? '',
          price: node.querySelector('a > div ~ div > div')?.textContent ?? '',
          url: `${origin}${pathname}`,
          createAd: new Date().toLocaleDateString('ru-RU'),
        };
      }
    });

    const saveAds = await db.getSavedAds(id);
    const newIds = compareCollections(saveAds, newAds);

    const statusCollectionAds = await db.isAdsEmpty(id);
    for (const newId of newIds) {
      const data = newAds[newId];
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

  // const collectionOldId = getOldIdAds(saveAds);

  // if (collectionOldId.length) {
  //   for (let i = 0; i > newIds.length; i++) {
  //     await db.removeOldAd(collectionOldId[i]);
  //     await pause(1000);
  //   }
  //   console.log(`Удалено старых объявлений ${newIds.length} из базы`);
  // }
})();
