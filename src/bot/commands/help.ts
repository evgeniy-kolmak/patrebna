import { bot } from 'bot';
import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import keyboard from 'bot/keyboard';
import db from 'config/db/databaseServise';

export default (): void => {
  const regex = /Помощь|Дапамога/;
  bot.onText(regex, (ctx) => {
    void (async () => {
      const userId = ctx.chat.id;
      await i18next.changeLanguage(await getUserLanguage(userId));
      const isBlocked = await db.isUserBlocked(userId);
      if (isBlocked) {
        await sendMessage(
          userId,
          t('Сообщение для заблокированного пользователя'),
        );
        return;
      }
      await sendMessage(userId, t('Сообщение для FAQ'), keyboard.Faq());
      await sendMessage(userId, t('Техподдержка'));
    })();
  });
};
