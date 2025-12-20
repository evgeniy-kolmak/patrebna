import { getUserLanguage } from 'config/lib/helpers/cacheLanguage';
import { editMessage } from 'config/lib/helpers/editMessage';
import { ratesData } from 'constants/rates';
import i18next, { t } from 'i18next';

export async function handleBuyBonus(
  chatId: number,
  messageId: number | undefined,
  callbackQueryId: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(chatId));
  const keyboard = {
    inline_keyboard: [
      ...ratesData.reduce<any[]>((rows, { name, orderId }, index) => {
        if (index % 2 === 0) {
          rows.push([]);
        }

        rows[rows.length - 1].push({
          text: t(name),
          callback_data: JSON.stringify({
            action: 'choose_rate',
            param: orderId,
          }),
        });

        return rows;
      }, []),
      [
        {
          text: t('Назад'),
          callback_data: JSON.stringify({ action: 'back_wallet' }),
        },
      ],
    ],
  };
  await editMessage(
    chatId,
    messageId,
    t('Сообщение над бонусами'),
    callbackQueryId,
    keyboard,
  );
}
