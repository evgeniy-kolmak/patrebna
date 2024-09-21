import TelegramBot from 'node-telegram-bot-api';
import 'config/i18n/i18n';
import cbquery from 'bot/cbquery';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
const PORT = Number(process.env.WEBHOOK_PORT) ?? 8443;
const URL = process.env.WEBHOOK_URL ?? '';

const options = {
  webHook: {
    port: PORT,
    cert: 'crt.pem',
  },
};

export const bot = new TelegramBot(TOKEN, options);

void (async () => {
  try {
    await bot.setWebHook(`${URL}:${PORT}/bot${TOKEN}`, {
      certificate: options.webHook.cert,
    });
    console.info('Webhook set is successfully');
  } catch (error) {
    console.error('The certificate could not be installed', error);
  }
})();

cbquery();
