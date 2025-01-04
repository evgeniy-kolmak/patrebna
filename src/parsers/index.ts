import jsdom from 'jsdom';
import { parserRealOfEstate } from 'parsers/kufar/categories/realEstate';
import { parserAuto } from 'parsers/kufar/categories/auto';
import { parserOthers } from 'parsers/kufar/categories/other';
import { type IAd, type TypesUrlParser } from 'config/types';
const { JSDOM } = jsdom;

const SELECTOR_AD_SECTION = 'div[class^="styles_wrapper__"] > div > section';

export function parserAds(typeAds: TypesUrlParser, html: string): IAd[] {
  const { document } = new JSDOM(html, {
    includeNodeLocations: true,
  }).window;
  const nodeList = document.querySelectorAll(SELECTOR_AD_SECTION);

  switch (typeAds) {
    case 're':
      return parserRealOfEstate(nodeList);
    case 'auto':
      return parserAuto(nodeList);
    default:
      return parserOthers(nodeList);
  }
}
