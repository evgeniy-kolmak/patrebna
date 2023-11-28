import { bot } from '../telegram/bot';
import db from '../database';
import fsp from 'fs/promises';
import { compareLengthPathPackages, pause } from '../utils';
import { createTrackCard } from '../tracker/createCard';

export default async function trackEvropochta(usersIds: string[]) {
  console.log(new Date().toLocaleTimeString('ru-RU'));
  for (const id of usersIds) {
    await pause(2500);
    const packages: ITrack[] = Object.values(await db.getPackages(id));
    if (packages) {
      packages
        .filter((item) => item.infoPoint !== 'Почтовое отправление выдано')
        .forEach(async (item) => {
          const isChangeLength: ITrack | undefined =
            await compareLengthPathPackages(item);
          if (isChangeLength) {
            const currentTrackData = await db.getTrack(id, item.trackNumber);
            const { trackNumber, infoPoint, lengthPath } = isChangeLength;
            const { comment } = currentTrackData;
            await createTrackCard({ trackNumber, infoPoint, comment });
            await bot.sendPhoto(
              id,
              `assets/track-card--${item.trackNumber}.jpg`,
              {
                caption: 'Статус посылки изменился.',
              },
            );
            await db.setCompareDataTrack(id, { ...isChangeLength });
            await fsp.rm(`assets/track-card--${item.trackNumber}.jpg`);
            console.log(
              `Статус посылки ${item.trackNumber}(${lengthPath}) изменился.`,
            );
          }
        });
    }
  }
}

export interface ITrack {
  infoPoint: string;
  trackNumber: string;
  comment?: string;
  lengthPath: number;
}
