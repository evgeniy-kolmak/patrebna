import db from 'config/db/databaseServise';
import { StatusPremium } from 'config/types';

export async function hasPremium(userId: number): Promise<boolean> {
  const premium = await db.getDataPremium(userId);

  return (
    premium?.status === StatusPremium.MAIN ||
    premium?.status === StatusPremium.BASE
  );
}
