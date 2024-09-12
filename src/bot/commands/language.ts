import { t } from 'i18next';
import { bot } from 'bot';
import keyboard from 'bot/keyboard';

export default (): void => {
  bot.onText(/Язык|Мова/, (ctx) => {
    void (async () => {
      const userID = ctx.chat.id;

      await bot.sendMessage(userID, t('Переключить язык приложения'), {
        reply_markup: keyboard.Button(t('Сменить язык'), 'change_language'),
      });
    })();
  });
};
