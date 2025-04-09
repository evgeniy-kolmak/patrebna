import axios, { AxiosError } from 'axios';
import db from 'config/db/databaseServise';
import pLimit from 'p-limit';
import { pause } from 'config/lib/helpers/pause';
import { notificationOfNewAds } from 'config/lib/helpers/notificationOfNewAds';
import { parserAds } from 'parsers';
import { type IParserData } from 'config/types';

export default async function parseKufar(
  users: Array<IParserData & { userId: number }>,
): Promise<void> {
  const limit = pLimit(10);
  const tasks = [];

  for (const user of users) {
    const { urls, userId } = user;
    if (!urls) continue;
    for (const { url, urlId, typeUrlParser } of urls.filter(
      ({ isActive }) => isActive,
    )) {
      tasks.push(
        limit(async () => {
          try {
            await pause(200);
            const { data } = await axios.get<string>(url);
            const ads = parserAds(typeUrlParser, data);
            if (!Array.isArray(ads) || !ads.length) return;
            const newAds = await db.addUniqueAds(userId, ads, urlId);
            await notificationOfNewAds(userId, newAds, user);
          } catch (error) {
            if (error instanceof AxiosError) {
              const { code, message } = error;
              console.error(`(${code}) ${message} - ${url}`);
            } else {
              console.error(error);
            }
          }
        }),
      );
    }
  }

  await Promise.all(tasks);
}
