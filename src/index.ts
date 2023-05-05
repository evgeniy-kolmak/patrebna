import * as dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;
import TelegramBot from 'node-telegram-bot-api';

const TOKEN = process.env.TG_TOKEN ?? '';
const bot = new TelegramBot(TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});

void (async () => {
  const url = 'https://www.kufar.by/l/';
  let html = '';

  try {
    const { data } = await axios.get(url);
    html = data;
  } catch (err) {
    console.log(err);
  }

  const { document } = new JSDOM(html).window;
  const items = document.querySelectorAll('section');
  bot.on('message', (msg) => {
    const chatID = msg.chat.id;
    bot.sendMessage(
      chatID,
      `По этой ссылеке найдено ${items.length} объявлений`,
    );
  });
})();
