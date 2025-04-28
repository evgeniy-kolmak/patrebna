import { t } from 'i18next';
import { sendMessage } from 'config/lib/helpers/sendMessage';

export async function notRegistrationMessage(
  userId: number,
  referrerId?: number,
): Promise<void> {
  await sendMessage(userId, t('Сообщение о регистрации'), {
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
  });
}
