import { type IAd } from 'config/types';

const TITLE_AD_SELECTOR = 'h3[class^="styles_title__"]';
const PRICE_AD_SELECTOR = 'p[class^=styles_price__] span';
const DISCOUNT_PRICE_AD_SELECTOR = 'span[class^=styles_price__]';
const IMAGE_URL_AD_SELECTOR = 'img[class^="styles_image__"]';

export function parserOthers(items: NodeListOf<Element>): IAd[] {
  const newAds: IAd[] = [];

  items.forEach((node) => {
    const urlItem = node.querySelector('a')?.getAttribute('href') ?? '';
    const url = new URL(urlItem);
    const { origin, pathname } = url;
    const urlAd = `${origin}${pathname}`;
    const itemIdAd = url.pathname.split('/')[2];
    const titleAd =
      node.querySelector(TITLE_AD_SELECTOR)?.textContent?.trim() ?? '';
    const imgUrlAd =
      node.querySelector(IMAGE_URL_AD_SELECTOR)?.getAttribute('src') ??
      'https://i.ibb.co/NLkvZYG/no-photo.webp';
    const priceAd =
      (
        node.querySelector(PRICE_AD_SELECTOR) ??
        node.querySelector(DISCOUNT_PRICE_AD_SELECTOR)
      )?.textContent?.replace(/[.]+$/, '') ?? '';

    newAds.push({
      img_url: imgUrlAd,
      id: itemIdAd,
      title: titleAd,
      price: priceAd,
      url: urlAd,
      createdAt: new Date(),
    });
  });
  return newAds;
}
