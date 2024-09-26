import { Languages } from 'config/types';

const userLanguageCache = new Map();

export const getUserLanguage = (chatID: number): Languages => {
  if (!userLanguageCache.has(chatID)) {
    userLanguageCache.set(chatID, Languages.Russian);
  }
  return userLanguageCache.get(chatID);
};

export const setUserLanguage = (chatID: number, language: Languages): void => {
  userLanguageCache.set(chatID, language);
};
