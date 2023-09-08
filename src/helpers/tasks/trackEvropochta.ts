import { bot } from '../telegram/bot';
import db, { ITrack } from '../database';
import fsp from 'fs/promises';
import { compareLengthPathPackages, pause } from '../utils';
import { createTrackCard } from '../tracker/createCard';

export default async function trackEvropochta(usersIds: string[]) {
  for (const id of usersIds) {
    await pause(2500);
    const packages: ITrack[] = Object.values(await db.getPackages(id));
    packages.forEach(async (item) => {
      const isChangeLength: ITrack | undefined =
        await compareLengthPathPackages(item);
      if (isChangeLength) {
        const currentTrackData = await db.getTrack(id, item.trackNumber);
        await createTrackCard(currentTrackData);
        await bot.sendPhoto(id, `assets/track-card--${item.trackNumber}.jpg`, {
          caption: 'Статус посылки изменился.',
        });
        await db.setCompareDataTrack(id, { ...isChangeLength });
        await fsp.rm(`assets/track-card--${item.trackNumber}.jpg`);
      }
    });
  }
}
