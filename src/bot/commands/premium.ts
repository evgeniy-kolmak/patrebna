import { bot } from 'bot';
import { createReadStream } from 'fs';
import keyboard from 'bot/keyboard';
import db from 'config/db/databaseServise';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { notRegistrationMessage } from 'config/lib/helpers/notRegistrationMessage';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import i18next, { t } from 'i18next';
import { sendPhoto } from 'config/lib/helpers/sendPhoto';

const SALES_IMAGE_PATH = 'src/bot/assets/images/ny-sales.webp';

export default (): void => {
  const regex = /Подписка|Падпіска/;
  bot.onText(regex, (ctx) => {
    void (async () => {
      const userId = ctx.chat.id;
      await i18next.changeLanguage(await getUserLanguage(userId));
      const isBlocked = await db.isUserBlocked(userId);
      if (isBlocked) {
        await sendMessage(
          userId,
          t('Сообщение для заблокированного пользователя'),
        );
        return;
      }
      const isRegistered = await db.getUser(userId);
      if (isRegistered) {
        await sendPhoto(
          userId,
          t('Новогодняя акция'),
          undefined,
          createReadStream(SALES_IMAGE_PATH),
        );
        await sendMessage(userId, t('Описание подписки'), keyboard.Premium());
      } else await notRegistrationMessage(userId);
    })();
  });
};
