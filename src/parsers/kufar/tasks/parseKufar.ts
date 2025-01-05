import axios from 'axios';
import pLimit from 'p-limit';
import db from 'config/db/databaseServise';
import { pause } from 'config/lib/helpers/pause';
import { notificationOfNewAds } from 'config/lib/helpers/notificationOfNewAds';
import { getUsers } from 'config/lib/helpers/getUsers';
import { parserAds } from 'parsers';
import { type IAd } from 'config/types';

export default async function parseKufar(): Promise<void> {
  const limit = pLimit(10);
  const users = await getUsers();

  for (const [key, value] of Object.entries(users)) {
    const urls = value.urls.flat();
    const response = await Promise.all(
      urls
        .filter(({ isActive }) => isActive)
        .map(async ({ url, typeUrlParser }) => {
          return await limit(async () => {
            try {
              await pause(200);
              const { data } = await axios.get<string>(url);
              return parserAds(typeUrlParser, data);
            } catch (error) {
              console.error(`Ошибка получения данных - ${url}:`, error);
            }
          });
        }),
    );
    const id = Number(key);
    const parseAds = response
      .flat()
      .filter((ad): ad is IAd => ad !== undefined);
    const newAds = await db.addUniqueAds(id, parseAds);
    await notificationOfNewAds(id, newAds, users);
  }
}
