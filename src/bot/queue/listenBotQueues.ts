import { sendMessageOfNewAd } from 'config/lib/helpers/sendMessageOfNewAd';
import cache from 'config/redis/redisService';
import {
  type IBotAdsMessage,
  type IBotNotificationMessage,
} from 'config/types';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import { pause } from 'config/lib/helpers/pause';

const redis = cache.getClient();

export async function listenBotQueues(): Promise<void> {
  while (true) {
    try {
      const result = await redis.blpop(
        ['bot_queue_ads', 'bot_queue_notifications'],
        0,
      );
      if (!result) continue;

      const [queue, payload] = result;
      const data = JSON.parse(payload);

      switch (queue) {
        case 'bot_queue_ads': {
          const { userId, newAds } = data as IBotAdsMessage;
          for (const ad of newAds) {
            await pause(1200);
            await sendMessageOfNewAd({ userId, ...ad });
          }
          break;
        }
        case 'bot_queue_notifications': {
          const { userId, text, keyboard } = data as IBotNotificationMessage;
          await sendMessage(userId, text, keyboard);
          break;
        }
      }
    } catch (error) {
      console.error('Ошибка слушителя', error);
      await pause(3000);
    }
  }
}
