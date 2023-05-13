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
  const parentPathRe = 'section';
  const parentPathAuto = '[data-cy=auto-listing-block] > div > div > section';
  const parentPathOthers = '[data-name=listings] > div > div > section';

  switch (typeAds) {
    case 're':
      return parserRealOfEstate(document.querySelectorAll(parentPathRe));
    case 'auto':
      return parserAuto(document.querySelectorAll(parentPathAuto));
    case 'others':
      return parserOthers(document.querySelectorAll(parentPathOthers));
  }
}

export type TypeAds = 're' | 'auto' | 'others';
