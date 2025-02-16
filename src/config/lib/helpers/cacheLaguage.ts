import cache from 'config/redis/redisService';
import { Languages, type LanguageOfUser } from 'config/types';

export const getUserLanguage = async (userId: number): Promise<Languages> => {
  const cacheLanguages = await cache.getCache('languages');
  if (cacheLanguages) {
    const languages: LanguageOfUser = JSON.parse(cacheLanguages);
    return languages[userId]?.language ?? Languages.Russian;
  }
  return Languages.Russian;
};

export const setUserLanguage = async (
  userId: number,
  language: Languages,
): Promise<void> => {
  const cacheLanguages = await cache.getCache('languages');
  let languages: LanguageOfUser = {};

  if (cacheLanguages) {
    languages = JSON.parse(cacheLanguages);
  }

  languages[userId] = { language };

  await cache.setCache('languages', languages, 60 * 60 * 24 * 30);
};
