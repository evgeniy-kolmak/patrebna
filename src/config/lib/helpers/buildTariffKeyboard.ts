import { t } from 'i18next';
import { tariffData } from 'constants/tariffs';
import { type TariffActions, type IButton } from 'config/types';

export function buildTariffKeyboard(tariffActions: TariffActions): IButton[][] {
  return tariffData.map(({ name, orderId, quantityOfDays }) => [
    {
      text: `${t(name)} — ${quantityOfDays} ${t('Дней')}`,
      callback_data: JSON.stringify({
        action: tariffActions,
        param: orderId,
      }),
    },
  ]);
}
