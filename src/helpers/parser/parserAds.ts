import jsdom from 'jsdom';
const { JSDOM } = jsdom;
import { ICollection, IAd } from '../database';
import { parserRealOfEstate } from './categories/realEstate';
import { parserAuto } from './categories/auto';
import { parserOthers } from './categories/others';

export function parserAds(typeAds: TypeAds, html: string): ICollection<IAd> {
  const { document } = new JSDOM(html, {
    includeNodeLocations: true,
  }).window;
  const nodeList = document.querySelectorAll(
    'div[class^="styles_cards__"] > section',
  );

  switch (typeAds) {
    case 're':
      return parserRealOfEstate(nodeList);
    case 'auto':
      return parserAuto(nodeList);
    case 'others':
      return parserOthers(nodeList);
  }
}

export type TypeAds = 're' | 'auto' | 'others';
