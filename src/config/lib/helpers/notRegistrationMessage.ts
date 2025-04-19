import { bot } from 'bot';
import { t } from 'i18next';

export async function notRegistrationMessage(
  userId: number,
  referrerId?: number,
): Promise<void> {
  await bot.sendMessage(userId, t('Сообщение о регистрации'), {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: t('Регистрация'),
            callback_data: JSON.stringify({
              action: 'registration',
              param: referrerId,
            }),
          },
        ],
      ],
    },
  });
}
