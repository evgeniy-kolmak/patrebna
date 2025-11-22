import axios, { AxiosError } from 'axios';
import db from 'config/db/databaseServise';
import cache from 'config/redis/redisService';
import pLimit from 'p-limit';
import { pause } from 'config/lib/helpers/pause';
import {
  type IAd,
  type IParserData,
  StatusPremium,
  type ExtendedAdForDescription,
} from 'config/types';

export async function parseKufar(
  users: Array<IParserData & { userId: number }>,
): Promise<void> {
  const limit = pLimit(10);
  const tasks = [];
  const HOST = process.env.HOST ?? '';

  for (const user of users) {
    const { urls, userId, status } = user;
    if (!urls) continue;
    for (const { url, urlId } of urls.filter(({ isActive }) => isActive)) {
      tasks.push(
        limit(async () => {
          try {
            await pause(200);
            const { data } = await axios.get<IAd[]>(
              `http://${HOST}:3000/api/ads`,
              {
                params: { url },
              },
            );

            if (!Array.isArray(data) || !data.length) return;
            const newAds = await db.addUniqueAds(userId, data, urlId);

            if (!newAds.length) return;
            if (status === StatusPremium.ACTIVE) {
              for (const ad of newAds as ExtendedAdForDescription[]) {
                const { data } = await axios.get<string>(
                  `http://${HOST}:3000/api/ad`,
                  {
                    params: { ad_id: ad.id },
                  },
                );
                ad.description = data;
              }
            }
            await cache.sendAdsToBot({
              userId,
              newAds,
              key:
                status === StatusPremium.ACTIVE
                  ? 'bot_queue_extended_ads'
                  : 'bot_queue_ads',
            });
          } catch (error) {
            if (error instanceof AxiosError) {
              const { response, message, config } = error;
              console.error(
                `(${response?.status}) ${message} - ${config?.url}`,
              );
            } else {
              console.error('Неизвестная ошибка парсинга:', error);
            }
          }
        }),
      );
    }
  }

  await Promise.all(tasks);
}
