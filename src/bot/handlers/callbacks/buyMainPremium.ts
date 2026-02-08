import i18next, { t } from 'i18next';
import { buildTariffKeyboard } from 'config/lib/helpers/buildTariffKeyboard';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { editMessage } from 'config/lib/helpers/editMessage';
import { type BackAction, type TariffActions } from 'config/types';

export async function handleBuyMainPremium(
  userId: number,
  messageId: number | undefined,
  callbackQueryId: string,
  tariffActions: TariffActions,
  backAction: BackAction,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(userId));

  await editMessage(
    userId,
    messageId,
    t('Сообщение над тарифами'),
    callbackQueryId,
    {
      inline_keyboard: [
        ...buildTariffKeyboard(tariffActions),
        [
          {
            text: t('Назад'),
            callback_data: JSON.stringify({ action: backAction }),
          },
        ],
      ],
    },
  );
}
