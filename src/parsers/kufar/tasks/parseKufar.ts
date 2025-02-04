import axios from 'axios';
import db from 'config/db/databaseServise';
import { pause } from 'config/lib/helpers/pause';
import { notificationOfNewAds } from 'config/lib/helpers/notificationOfNewAds';
import { parserAds } from 'parsers';
import { type UsersParserData } from 'config/types';

export default async function parseKufar(
  users: UsersParserData,
): Promise<void> {
  for (const [key, value] of Object.entries(users)) {
    const id = Number(key);
    for (const { url, typeUrlParser, urlId, isActive } of value.urls.flat()) {
      if (!isActive) continue;
      try {
        await pause(200);
        const { data } = await axios.get<string>(url);
        const ads = parserAds(typeUrlParser, data);
        const newAds = await db.addUniqueAds(id, ads, urlId);
        await notificationOfNewAds(id, newAds, users);
      } catch (error) {
        console.error(`Ошибка получения данных - ${url}:`, error);
      }
    }
  }
}
