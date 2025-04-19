import { bot } from 'bot';
import i18next, { t } from 'i18next';
import db from 'config/db/databaseServise';
import keyboard from 'bot/keyboard';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { notRegistrationMessage } from 'config/lib/helpers/notRegistrationMessage';

export default (): void => {
  const regex = /\/start(?: (.+))?/;
  bot.onText(regex, (ctx, match) => {
    void (async () => {
      const userId = ctx.chat.id;
      const payload = match?.[1] ?? null;
      let referrerId: number | undefined;
      if (payload?.startsWith('ref')) {
        const parsed = Number(payload.slice(3));
        if (!isNaN(parsed)) {
          referrerId = parsed;
        }
      }
      await i18next.changeLanguage(await getUserLanguage(userId));
      const isRegistered = await db.getUser(userId);
      await bot.sendMessage(userId, t('Приветствие'), {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: keyboard.Main(),
      });
      if (isRegistered) {
        await bot.sendMessage(userId, t('Сообщение об отслеживании'), {
          reply_markup: keyboard.Observe(),
        });
      } else await notRegistrationMessage(userId, referrerId);
    })();
  });
};
