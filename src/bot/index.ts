import TelegramBot from 'node-telegram-bot-api';
import 'config/i18n/i18n';
import cbquery from 'bot/cbquery';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
const PORT = Number(process.env.WEBHOOK_PORT) ?? 8443;
const HOST = process.env.WEBHOOK_HOST ?? '';
const WEBHOOK_URL = `${HOST}:${PORT}/bot${TOKEN}`;

const options = {
  webHook: {
    port: PORT,
    key: './certs/bot/key.pem',
    cert: './certs/bot/cert.pem',
  },
};

export const bot = new TelegramBot(TOKEN, options);

void (async () => {
  try {
    const { url } = await bot.getWebHookInfo();
    if (url !== WEBHOOK_URL) {
      await bot.setWebHook(WEBHOOK_URL, {
        certificate: options.webHook.cert,
      });
      console.info('Webhook was successfully set');
    }
  } catch (error) {
    console.error('The certificate could not be installed', error);
  }
})();

void cbquery();
