import i18next, { t } from 'i18next';
import { bot } from 'bot';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';

export default (): void => {
  const regex = /Язык|Мова/;
  bot.onText(regex, (ctx) => {
    void (async () => {
      const userID = ctx.chat.id;
      await i18next.changeLanguage(getUserLanguage(userID));
      await bot.sendMessage(userID, t('Переключить язык приложения'), {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: t('Сменить язык'),
                callback_data: JSON.stringify({ action: 'change_language' }),
              },
            ],
          ],
        },
      });
    })();
  });
};
