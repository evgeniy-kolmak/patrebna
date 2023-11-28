import { conf } from '../../config';
import cbquery from '../cbquery';

import TelegramBot from 'node-telegram-bot-api';
const TOKEN = conf.tokenBot;
const URL = conf.webhook.url;
const PORT = conf.webhook.port;

const options = {
  webHook: {
    port: PORT,
    key: 'key.pem',
    cert: 'crt.pem',
  },
};
process.env['NTBA_FIX_350'] = '1';

export const bot = new TelegramBot(TOKEN, options);

bot.setWebHook(`${URL}:${PORT}/bot${TOKEN}`, {
  certificate: options.webHook.cert,
});

cbquery();
