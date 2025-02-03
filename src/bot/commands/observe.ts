import i18next, { t } from 'i18next';
import { bot } from 'bot';
import db from 'config/db/databaseServise';
import keyboard from 'bot/keyboard';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { notRegistrationMessage } from 'config/lib/helpers/notRegistrationMessage';

export default (): void => {
  bot.onText(/Отслеживать|Адсочваць/, (ctx) => {
    void (async () => {
      const userId = ctx.chat.id;
      await i18next.changeLanguage(getUserLanguage(userId));
      const isRegistred = await db.getUser(userId);
      if (isRegistred) {
        await bot.sendMessage(userId, t('Сообщение об отслеживании'), {
          reply_markup: keyboard.Observe(),
        });
      } else await notRegistrationMessage(userId);
    })();
  });
};
