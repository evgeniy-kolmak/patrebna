import { bot } from 'bot';
import keyboard from 'bot/keyboard';
import db from 'config/db/databaseServise';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { notRegistrationMessage } from 'config/lib/helpers/notRegistrationMessage';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import i18next, { t } from 'i18next';

export default (): void => {
  const regex = /Подписка|Падпіска/;
  bot.onText(regex, (ctx) => {
    void (async () => {
      const userId = ctx.chat.id;
      await i18next.changeLanguage(await getUserLanguage(userId));
      const isRegistered = await db.getUser(userId);
      if (isRegistered) {
        await sendMessage(userId, t('Описание подписки'), keyboard.Premium());
      } else await notRegistrationMessage(userId);
    })();
  });
};
