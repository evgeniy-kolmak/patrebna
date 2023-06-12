import { conf } from '../../config';
import cbquery from '../cbquery';

import TelegramBot from 'node-telegram-bot-api';
const TOKEN = conf.tokenBot;
const URL = conf.webhook.url;
const PORT = conf.webhook.port;
export const bot = new TelegramBot(TOKEN, {
  webHook: {
    port: PORT,
  },
});

bot.setWebHook(`${URL}/${TOKEN}`);
process.env['NTBA_FIX_350'] = '1';

cbquery();
