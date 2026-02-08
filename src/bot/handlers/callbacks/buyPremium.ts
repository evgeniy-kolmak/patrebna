import i18next, { t } from 'i18next';
import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { editMessage } from 'config/lib/helpers/editMessage';
import {
  StatusPremium,
  type IPremiumActions,
  type TariffActions,
} from 'config/types';
import keyboards from 'bot/keyboards';

export async function handleBuyPremium(
  userId: number,
  messageId: number | undefined,
  callbackQueryId: string,
  statusPremium: StatusPremium | undefined,
  actions: IPremiumActions,
  tariffActions: TariffActions,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(userId));
  await editMessage(
    userId,
    messageId,
    t(
      statusPremium === StatusPremium.MAIN
        ? 'Сообщение над тарифами'
        : 'Выбор типа подписки',
    ),
    callbackQueryId,
    keyboards.TypesOfPremium(statusPremium, actions, tariffActions),
  );
}
