/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { t } from 'i18next';
import { bot } from 'bot';
import db from 'config/db/databaseServise';
import keyboard from 'bot/keyboard';

export default (): void => {
  bot.onText(/Профиль|Профіль/, (ctx) => {
    void (async () => {
      const userID = ctx.chat.id;
      const isUser = await db.getUser(userID);
      if (isUser) {
        const profile = await db.getProfile(userID);
        const dataProfile = `<b>ФИО</b>: ${profile?.first_name ?? ''} ${profile?.last_name ?? ''}\n<b>Псевдоним</b>: ${profile?.username ?? ''}\n<b>Подписка</b>: ${profile?.premium ? new Date(profile.premium * 1000).toLocaleDateString('ru-RU') : '➖'} \n<b>Cсылка</b>: ${profile?.link ?? '❌'}\n<b>Количество объявлений</b>: ${profile?.count_ads ?? 0}`;
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
