import { ICollection, IAd } from './database';

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

export function getOldIdAds(src: ICollection<IAd>): string[] {
  const date = new Date().toLocaleDateString('ru-RU');
  const oldAdsId: string[] = [];
  Object.entries(src).forEach((item) => {
    if (item[1].createAd !== date) {
      oldAdsId.push(item[0]);
    }
  });
  return oldAdsId;
}
