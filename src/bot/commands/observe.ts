import i18next, { t } from 'i18next';
import { bot } from 'bot';
import db from 'config/db/databaseServise';
import keyboard from 'bot/keyboard';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';

export default (): void => {
  bot.onText(/Отслеживать|Адсочваць/, (ctx) => {
    void (async () => {
      const userID = ctx.chat.id;
      const isUser = await db.getUser(userID);
      await i18next.changeLanguage(getUserLanguage(userID));
      if (isUser) {
        await bot.sendMessage(userID, t('Сообщение об отслеживании'), {
          reply_markup: keyboard.Observe(),
        });
      } else {
        await bot.sendMessage(userID, t('Сообщение о регистрации'), {
          reply_markup: keyboard.Button(t('Регистрация'), 'registration'),
        });
      }
    })();
  });
};
