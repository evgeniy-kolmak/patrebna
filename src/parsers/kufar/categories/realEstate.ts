import { type IAd } from 'config/types';

const TITLE_AD_SELECTOR = 'div[class^="styles_parameters"]';
const DESCRIPTION_AD_SELECTOR = 'p[class^="styles_body__"]';
const PRICE_AD_SELECTOR = 'span[class^=styles_price__]';
const IMAGE_URL_AD_SELECTOR = 'div[class^=styles_container__] > img';

export function parserRealOfEstate(items: NodeListOf<Element>): IAd[] {
  const newAds: IAd[] = [];

  items.forEach((node) => {
    const urlItem = node.querySelector('a')?.getAttribute('href') ?? '';
    const url = new URL(urlItem);
    const { origin, pathname } = url;
    const urlAd = `${origin}${pathname}`;
    const itemPath = url.pathname.split('/');
    const itemIdAd = itemPath[itemPath.length - 1];
    const titleAd = node.querySelector(TITLE_AD_SELECTOR)?.textContent ?? '';
    const descriptionAd =
      node.querySelector(DESCRIPTION_AD_SELECTOR)?.textContent ?? '';
    const priceAd = Array.from(node.querySelectorAll(PRICE_AD_SELECTOR))
      .map((e) => e.textContent?.replace(/[*]/g, ''))
      .join(' / ');
    const imgUrlAd =
      node.querySelector(IMAGE_URL_AD_SELECTOR)?.getAttribute('src') ??
      'https://i.ibb.co/NLkvZYG/no-photo.webp';

    newAds.push({
      img_url: imgUrlAd,
      id: itemIdAd,
      title: titleAd,
      price: priceAd,
      url: urlAd,
      description: descriptionAd,
      createdAt: new Date(),
    });
  });
  return newAds;
}
