import path from 'path';
import { fork } from 'child_process';
import TelegramBot from 'node-telegram-bot-api';
import Bottleneck from 'bottleneck';
import 'config/i18n/i18n';
import keyboards from 'bot/keyboards';
import cbquery from 'bot/cbquery';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import {
  type IBotAdsMessage,
  type IBotNotificationMessage,
  type IAd,
  type IExtendedAd,
} from 'config/types';
import { sendPhoto } from 'config/lib/helpers/sendPhoto';
import { getBaseNotification } from 'config/lib/helpers/getBaseNotification';
import { getExtendedNotification } from 'config/lib/helpers/getExtendedNotification';

(process as any).noDeprecation = true;

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
const PORT = Number(process.env.WEBHOOK_PORT) ?? 8443;
const HOST = process.env.HOST ?? '';
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

const listener = fork(path.resolve(__dirname, 'queue', 'listenBotQueues.ts'), {
  execArgv: ['-r', 'ts-node/register'],
});

const limiter = new Bottleneck({
  minTime: 1000,
  maxConcurrent: 1,
});

listener.on('message', (message: [string, string]) => {
  void (async () => {
    const [queue, payload] = message;
    const data = JSON.parse(payload);

    switch (queue) {
      case 'bot_queue_ads': {
        const { userId, newAds } = data as IBotAdsMessage;
        for (const ad of newAds) {
          await limiter.schedule(async () => {
            const { url, image, caption } = await getBaseNotification(
              ad as IAd & { userId: number },
            );
            await sendPhoto(
              userId,
              caption,
              keyboards.BaseForMessage(url),
              image,
            );
          });
        }

        break;
      }
      case 'bot_queue_extended_ads': {
        const { userId, newAds } = data as IBotAdsMessage;
        for (const ad of newAds) {
          await limiter.schedule(async () => {
            const { url, image, coordinates, caption } =
              await getExtendedNotification(
                ad as IExtendedAd & {
                  userId: number;
                  description: string;
                },
              );
            await sendPhoto(
              userId,
              caption,
              keyboards.ExpendedForMessage(url, coordinates),
              image,
            );
          });
        }
        break;
      }
      case 'bot_queue_notifications': {
        const { userId, text, keyboard } = data as IBotNotificationMessage;
        await sendMessage(userId, text, keyboard);
        break;
      }
    }
  })();
});

void cbquery();
