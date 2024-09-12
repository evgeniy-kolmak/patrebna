import TelegramBot from 'node-telegram-bot-api';
import { conf } from 'config/config';
import 'config/i18n/i18n';
import cbquery from 'bot/cbquery';

const TOKEN = conf.tokenBot;

export const bot = new TelegramBot(TOKEN, { polling: true });

cbquery();
