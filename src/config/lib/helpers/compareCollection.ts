import { type IAd } from 'config/types';

export function compareCollections(src: IAd[], updates: IAd[]): string[] {
  const srcIds = src.map((ad) => ad.id);
  const updatesIds = updates.map((ad) => ad.id);

  return updatesIds.filter((id) => !srcIds.includes(id));
}
