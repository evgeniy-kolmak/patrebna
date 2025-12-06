import { bot } from 'bot';
import i18next, { t } from 'i18next';
import db from 'config/db/databaseServise';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import { notRegistrationMessage } from './notRegistrationMessage';
import { type ICommandHandler } from 'config/types';

export async function сommandsWrapper({
  regex,
  handler,
  options = { public: false },
}: ICommandHandler): Promise<void> {
  bot.onText(regex, (ctx, match) => {
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
      if (!options.public) {
        const isRegistered = await db.getUser(userId);
        if (!isRegistered) {
          await notRegistrationMessage(userId);
          return;
        }
      }
      await handler(userId, match);
    })();
  });
}
