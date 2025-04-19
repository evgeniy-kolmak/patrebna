import { bot } from 'bot';
import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';

export default (): void => {
  const regex = /Помощь|Дапамога/;
  bot.onText(regex, (ctx) => {
    void (async () => {
      const userId = ctx.chat.id;
      await i18next.changeLanguage(await getUserLanguage(userId));
      await bot.sendMessage(userId, t('Техподдержка'), {
        parse_mode: 'HTML',
      });
    })();
  });
};
