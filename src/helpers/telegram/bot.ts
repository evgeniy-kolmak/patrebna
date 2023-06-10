import { conf } from '../../config';

import TelegramBot from 'node-telegram-bot-api';
const TOKEN = conf.tokenBot ?? '';
export const bot = new TelegramBot(TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});
process.env['NTBA_FIX_350'] = '1';
