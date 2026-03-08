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
      const { id, type } = ctx.chat;
      if (type !== 'private') {
        await sendMessage(
          id,
          '🤖 Я могу работать только в <b>личных чатах</b>.\nПожалуйста, напишите <a href="https://t.me/patrebnaBot?start=source_group">мне</a> в личные сообщения.',
        );
        return;
      }
      await i18next.changeLanguage(await getUserLanguage(id));
      const isBlocked = await db.isUserBlocked(id);
      if (isBlocked) {
        await sendMessage(id, t('Сообщение для заблокированного пользователя'));
        return;
      }
      if (!options.public) {
        const isRegistered = await db.getUser(id);
        if (!isRegistered) {
          await notRegistrationMessage(id);
          return;
        }
      }
      await handler(id, match);
    })();
  });
}
