import { IAd, ICollection } from './tasks/parseKufar';
import { ITrack } from './tasks/trackEvropochta';

import { IDataApiError, getDataForTrackNumber } from './tracker/addTracks';

export function pause(val = 500) {
  return new Promise((resolve) => {
    setTimeout(resolve, val);
  });
}

export function compareCollections(
  src: ICollection<IAd>,
  updates: ICollection<IAd>,
): string[] {
  return Object.keys(updates).filter((key: string) => !src[key]);
}

export async function compareLengthPathPackages(
  dataTrack: ITrack | IDataApiError,
) {
  if ('trackNumber' in dataTrack) {
    const newDataTrack = await getDataForTrackNumber(dataTrack.trackNumber);
    if ('trackNumber' in newDataTrack) {
      if (newDataTrack.lengthPath !== dataTrack.lengthPath) {
        const dataTrackMessage: ITrack = {
          infoPoint: newDataTrack.infoPoint,
          trackNumber: newDataTrack.trackNumber,
          lengthPath: newDataTrack.lengthPath,
          comment: newDataTrack.comment,
        };
        return dataTrackMessage;
      }
    }
  }
}

export const truncateString = (s: string, w: number) =>
  s.length > w ? `${s.substring(0, w)} ...` : s;
