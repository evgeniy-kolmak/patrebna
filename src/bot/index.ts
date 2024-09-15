import TelegramBot from 'node-telegram-bot-api';
import 'config/i18n/i18n';
import cbquery from 'bot/cbquery';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';

export const bot = new TelegramBot(TOKEN, { polling: true });

cbquery();
