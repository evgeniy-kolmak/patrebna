import { ICollection, IAd } from '../../database';

export function parserAuto(items: NodeListOf<HTMLElement>): ICollection<IAd> {
  return items;
}
