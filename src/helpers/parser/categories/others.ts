import { IAd, ICollection } from '../../tasks/parseKufar';

const TITLE_AD_SELECTOR = 'h3[class^="styles_title__"]';
const PRICE_AD_SELECTOR = 'p[class^=styles_price__] span';
const IMAGE_URL_AD_SELECTOR = 'img[class^="styles_image__"]';
const COMPANY_AD_SELECTOR = 'div[class^="styles_badge__"]';

export function parserOthers(items: NodeListOf<Element>): ICollection<IAd> {
  const newAds: ICollection<IAd> = {};

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
      'assets/no-photo.webp';
    const priceAd =
      node
        .querySelector(PRICE_AD_SELECTOR)
        ?.textContent?.replace(/[.]+$/, '') ?? '';
    const isNotCompanyAd =
      !node.querySelector(COMPANY_AD_SELECTOR)?.textContent;

    if (isNotCompanyAd) {
      newAds[itemIdAd] = {
        img_url: imgUrlAd,
        id: itemIdAd,
        title: titleAd,
        price: priceAd,
        url: urlAd,
        createAd: new Date().toLocaleDateString('ru-RU'),
      };
    }
  });
  return newAds;
}
