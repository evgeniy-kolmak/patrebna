import { bot } from 'bot';
import db from 'config/db/databaseServise';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { notRegistrationMessage } from 'config/lib/helpers/notRegistrationMessage';
import i18next, { t } from 'i18next';

export default (): void => {
  const regex = /Подписка|Падпіска/;
  bot.onText(regex, (ctx) => {
    void (async () => {
      const userId = ctx.chat.id;
      await i18next.changeLanguage(getUserLanguage(userId));
      const isRegistred = await db.getUser(userId);
      if (isRegistred) {
        await bot.sendMessage(userId, t('Описание подписки'), {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: t('Купить подписку'),
                  callback_data: JSON.stringify({ action: 'buy_premium' }),
                },
              ],
              [
                {
                  text: t('Получить подписку'),
                  callback_data: JSON.stringify({ action: 'get_free_premium' }),
                },
              ],
            ],
          },
        });
      } else await notRegistrationMessage(userId);
    })();
  });
};
