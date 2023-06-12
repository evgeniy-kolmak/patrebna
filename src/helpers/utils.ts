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

