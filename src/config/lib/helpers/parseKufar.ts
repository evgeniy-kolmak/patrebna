import { parserAds } from 'parsers';
import db from 'config/db/databaseServise';
import { compareCollections } from './compareCollection';
import { type TypesParser, type IAd } from 'config/types';

export const parseKufar = async (
  html: string,
  userId: number,
  typeUrlParser: TypesParser,
): Promise<void> => {
  const parserData = parserAds(typeUrlParser, html);
  const saveIds = (await db.getSavedIds(userId)) as string[];
  const parseIds = parserData.map((ad) => ad.id);
  const newIds = compareCollections(saveIds, parseIds);
  for (const newId of newIds) {
    const data = parserData.find((ad: IAd) => ad.id === newId);
    if (data) {
      await db.setAdKufar(data, userId);
    }
  }
};
