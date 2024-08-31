import { conf } from 'config/config';
import cbquery from 'helpers/cbquery';

import TelegramBot from 'node-telegram-bot-api';
const TOKEN = conf.tokenBot;
export const bot = new TelegramBot(TOKEN, { polling: true });

cbquery();
