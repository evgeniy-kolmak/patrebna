import jsdom from 'jsdom';
const { JSDOM } = jsdom;
import { IAd, ICollection } from '../tasks/parseKufar';
import { parserRealOfEstate } from './categories/realEstate';
import { parserAuto } from './categories/auto';
import { parserOthers } from './categories/others';

const SELECTOR_AD_SECTION = 'div[class^="styles_wrapper__"] > div > section';

export function parserAds(typeAds: TypeAds, html: string): ICollection<IAd> {
  const { document } = new JSDOM(html, {
    includeNodeLocations: true,
  }).window;
  const nodeList = document.querySelectorAll(SELECTOR_AD_SECTION);

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
