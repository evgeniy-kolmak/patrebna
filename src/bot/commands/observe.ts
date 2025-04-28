import { bot } from 'bot';
import i18next, { t } from 'i18next';
import db from 'config/db/databaseServise';
import keyboard from 'bot/keyboard';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { notRegistrationMessage } from 'config/lib/helpers/notRegistrationMessage';
import { sendMessage } from 'config/lib/helpers/sendMessage';

export default (): void => {
  const regex = /Отслеживать|Адсочваць/;
  bot.onText(regex, (ctx) => {
    void (async () => {
      const userId = ctx.chat.id;
      await i18next.changeLanguage(await getUserLanguage(userId));
      const isRegistered = await db.getUser(userId);
      if (isRegistered) {
        await sendMessage(
          userId,
          t('Сообщение об отслеживании'),
          keyboard.Observe(),
        );
      } else await notRegistrationMessage(userId);
    })();
  });
};
