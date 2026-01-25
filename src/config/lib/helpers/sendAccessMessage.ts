import { t } from 'i18next';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import keyboards from 'bot/keyboards';

export async function sendAccessMessage(
  userId: number,
  isPremium: boolean,
  isTrial: boolean,
): Promise<void> {
  if (isPremium) {
    await sendMessage(
      userId,
      t('Сообщение об отслеживании'),
      keyboards.Observe(),
    );
    return;
  }

  await sendMessage(
    userId,
    isTrial ? t('Триал использован') : t('Триал  сообщение'),
    keyboards.Trial(isTrial),
  );
}
