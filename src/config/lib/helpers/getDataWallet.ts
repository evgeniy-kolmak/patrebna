import db from 'config/db/databaseServise';
import { t } from 'i18next';

export async function getDataWallet(userId: number): Promise<string> {
  const wallet = await db.getWallet(userId);
  return [
    `${t('Сообщение о кошельке')}`,
    '',
    `<b>${t('Баланс')}</b>: ${wallet} 🪙`,
  ].join('\n');
}
