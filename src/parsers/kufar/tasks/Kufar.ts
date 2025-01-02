import db from 'config/db/databaseServise';
import axios from 'axios';
import { parserAds } from 'parsers';
import { pause } from 'config/lib/helpers/pause';
import { compareCollections } from 'config/lib/helpers/compareCollection';
import { sendMessageOfNewAd } from 'config/lib/helpers/sendMessageOfNewAd';
import { type IAd, type TypesParser } from 'config/types';

export default async function Kufar(usersIds: number[]): Promise<void> {
  console.info(
    `Время запуска парсера: ${new Date().toLocaleTimeString('ru-RU')}\nКоличество пользователей: ${usersIds.length}`,
  );
  for (const [index, userId] of usersIds.entries()) {
    const dataParser = await db.getDataParser(userId);
    const url = dataParser?.url;
    let html = '';
    if (url) {
      try {
        const { data } = await axios.get(url);
        html = data;
      } catch (error) {
        console.error(error);
      }

      const typeUrlParser = dataParser.typeUrlParser as TypesParser;
      const parserData = parserAds(typeUrlParser, html);
      const saveIds = (await db.getSavedIds(userId)) as string[];
      const parseIds = parserData.map((ad) => ad.id);
      const newIds = compareCollections(saveIds, parseIds);

      for (const newId of newIds) {
        const data = parserData.find((ad: IAd) => ad.id === newId);
        if (data) {
          await db.setAdKufar(data, userId);
          await pause(2500);
          await sendMessageOfNewAd({ userId, ...data });
        }
      }
      if (newIds.length) {
        console.info(
          `${index}). Добавлено новых объявлений ${newIds.length} в базу`,
        );
      }
    }
  }
}
