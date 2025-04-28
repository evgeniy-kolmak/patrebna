import { bot } from 'bot';
import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import keyboard from 'bot/keyboard';

export default (): void => {
  const regex = /Помощь|Дапамога/;
  bot.onText(regex, (ctx) => {
    void (async () => {
      const userId = ctx.chat.id;
      await i18next.changeLanguage(await getUserLanguage(userId));
      await sendMessage(userId, t('Сообщение для FAQ'), keyboard.Faq());
      await sendMessage(userId, t('Техподдержка'));
    })();
  });
};
