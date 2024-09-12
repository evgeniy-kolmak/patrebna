import db from 'config/db/databaseServise';
import axios from 'axios';
import { parserAds } from 'parsers';
import { pause } from 'config/lib/helpers/pause';
import { compareCollections } from 'config/lib/helpers/compareCollection';
import { sendMessageOfNewAd } from 'config/lib/helpers/sendMessageOfNewAd';
import { type IAd, type TypesParser } from 'config/types';

export default async function parseKufar(usersIds: number[]): Promise<void> {
  console.log(new Date().toLocaleTimeString('ru-RU'));
  for (const userId of usersIds) {
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
      const saveAds = (await db.getSavedAds(userId)) as IAd[];

      const newIds = compareCollections(saveAds, parserData);

      const statusCollectionAds = await db.isAdsEmpty(userId);
      for (const newId of newIds) {
        const data = parserData.find((ad: IAd) => ad.id === newId);
        if (data) {
          await db.setAdKufar(data, userId);
          await pause(2500);
          if (statusCollectionAds) {
            await sendMessageOfNewAd({ userId, ...data });
          }
        }
      }
      console.log(`Добавлено новых объявлений ${newIds.length} в базу`);
    }
  }
}
