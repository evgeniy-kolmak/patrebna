/* eslint-disable @typescript-eslint/no-non-null-assertion */
import i18next, { t } from 'i18next';
import { bot } from 'bot';
import db from 'config/db/databaseServise';
import keyboard from 'bot/keyboard';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { notRegistrationMessage } from 'config/lib/helpers/notRegistrationMessage';

export default (): void => {
  bot.onText(/Профиль|Профіль/, (ctx) => {
    void (async () => {
      const userId = ctx.chat.id;
      await i18next.changeLanguage(getUserLanguage(userId));
      const isUser = await db.getUser(userId);
      if (isUser) {
        const profile = await db.getProfile(userId);
        const dataProfile = `<b>${t('ФИО')}</b>: ${profile?.last_name ?? ''} ${profile?.first_name ?? ''}${profile?.username ? `\n<b>${t('Псевдоним')}</b>: ${profile?.username ?? ''}` : ''}\n<b>${t('Подписка')}</b>: '➖'} \n<b>${t('Ссылка')}</b>: '❌'}\n<b>${t('Количество объявлений')}</b>: 0`;
        await bot.sendMessage(userId, dataProfile, {
          parse_mode: 'HTML',
          reply_markup: await keyboard.Profile(userId),
        });
      } else await notRegistrationMessage(userId);
    })();
  });
};
