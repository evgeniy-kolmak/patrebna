import { IUser } from '../tasks/parseKufar';
import db from '../database';

export async function typeUrlParser(
  urlUser: string,
  user: IUser,
): Promise<void> {
  const { host } = new URL(urlUser);

  const typeAds = host.split('.')[0];

  switch (typeAds) {
    case 're':
      await db.setUserTypeParser('re', user);
      break;
    case 'auto':
      await db.setUserTypeParser('auto', user);
      break;
    default:
      db.setUserTypeParser('others', user);
      break;
  }
}
