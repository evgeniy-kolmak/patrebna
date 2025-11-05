import i18next, { t } from 'i18next';
import { bot } from 'bot';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import db from 'config/db/databaseServise';

export default (): void => {
  const regex = /Язык|Мова/;
  bot.onText(regex, (ctx) => {
    void (async () => {
      const userId = ctx.chat.id;
      const isBlocked = await db.isUserBlocked(userId);
      if (isBlocked) {
        await sendMessage(
          userId,
          t('Сообщение для заблокированного пользователя'),
        );
        return;
      }
      await i18next.changeLanguage(await getUserLanguage(userId));
      await sendMessage(userId, t('Переключить язык приложения'), {
        inline_keyboard: [
          [
            {
              text: t('Сменить язык'),
              callback_data: JSON.stringify({ action: 'change_language' }),
            },
          ],
        ],
      });
    })();
  });
};
