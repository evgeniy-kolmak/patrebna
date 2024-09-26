/* eslint-disable @typescript-eslint/no-non-null-assertion */
import i18next, { t } from 'i18next';
import { bot } from 'bot';
import db from 'config/db/databaseServise';
import keyboard from 'bot/keyboard';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';

export default (): void => {
  bot.onText(/Профиль|Профіль/, (ctx) => {
    void (async () => {
      const userID = ctx.chat.id;
      await i18next.changeLanguage(getUserLanguage(userID));
      const isUser = await db.getUser(userID);
      if (isUser) {
        const profile = await db.getProfile(userID);
        const dataProfile = `<b>${t('ФИО')}</b>: ${profile?.last_name ?? ''} ${profile?.first_name ?? ''}\n<b>${t('Псевдоним')}</b>: ${profile?.username ?? ''}\n<b>${t('Подписка')}</b>: ${profile?.premium ? new Date(profile.premium * 1000).toLocaleDateString('ru-RU') : '➖'} \n<b>${t('Ссылка')}</b>: ${profile?.link ?? '❌'}\n<b>${t('Количество объявлений')}</b>: ${profile?.count_ads ?? 0}`;
        await bot.sendMessage(userID, dataProfile, {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        });
        await bot.sendMessage(userID, t('Помощь'), {
          parse_mode: 'HTML',
          reply_markup: await keyboard.Profile(userID),
        });
      } else {
        await bot.sendMessage(userID, t('Сообщение о регистрации'), {
          reply_markup: keyboard.Button(t('Регистрация'), 'registration'),
        });
      }
    })();
  });
};
