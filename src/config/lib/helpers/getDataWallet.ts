import db from 'config/db/databaseServise';
import { t } from 'i18next';

export async function getDataWallet(
  title: string,
  userId: number,
): Promise<string> {
  const wallet = await db.getWallet(userId);
  return [`${title}`, '', `<b>${t('Баланс')}</b>: ${wallet} 🪙`].join('\n');
}
