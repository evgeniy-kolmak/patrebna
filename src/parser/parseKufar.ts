import { api } from 'services/apiClient';
import db from 'config/db/databaseServise';
import cache from 'config/redis/redisService';
import pLimit from 'p-limit';
import { pause } from 'config/lib/helpers/pause';
import {
  type IAd,
  type IParserData,
  StatusPremium,
  type IExtendedAd,
} from 'config/types';

export async function parseKufar(
  users: Array<IParserData & { userId: number }>,
): Promise<void> {
  const limit = pLimit(10);
  const tasks = [];

  for (const user of users) {
    const { urls, userId, status } = user;
    if (!urls) continue;
    for (const { url, urlId } of urls.filter(({ isActive }) => isActive)) {
      tasks.push(
        limit(async () => {
          try {
            await pause(200);
            const encodedUrl = encodeURIComponent(url);
            const { data } = await api.get<IAd[]>(`ads?url=${encodedUrl}`);

            if (!Array.isArray(data) || !data.length) return;
            const newAds = await db.addUniqueAds(userId, data, urlId);

            if (!newAds.length) return;
            if (status === StatusPremium.MAIN) {
              for (const ad of newAds as Array<
                IExtendedAd & { description: string }
              >) {
                try {
                  const { data } = await api.get<string>('ad', {
                    params: { ad_id: ad.id },
                  });
                  ad.description = data;
                  await pause(300);
                } catch (error) {
                  console.error(
                    'Ошибка при получении описания объявления:',
                    error,
                  );
                }
              }
            }
            await cache.sendAdsToBot({
              userId,
              newAds,
              key:
                status === StatusPremium.MAIN
                  ? 'bot_queue_extended_ads'
                  : 'bot_queue_ads',
            });
          } catch (error) {
            console.error('Ошибка при парсинге ссылки:', error);
          }
        }),
      );
    }
  }

  await Promise.all(tasks);
}
