import { IAd, ICollection } from '../../tasks/parseKufar';

const TITLE_AD_SELECTOR = 'h3[class^="styles_info__title__"]';
const DESCRIPTION_AD_SELECTOR = 'p[class^="styles_description__params__"]';
const DESCRIPTION_YEAR_AD_SELECTOR = 'div[class^="styles_description__"] > p';
const DESCRIPTION_MILEAGE_AD_SELECTOR =
  'p[class^="styles_description__params__"] ~ p';
const PRICE_AD_SELECTOR = 'div[class^=styles_info__price__] > span';
const IMAGE_URL_AD_SELECTOR = 'div[class^="styles_segment__"]';
const COMPANY_AD_SELECTOR = 'div[class^="styles_badge__"]';

export function parserAuto(items: NodeListOf<Element>): ICollection<IAd> {
  const newAds: ICollection<IAd> = {};

  items.forEach((node) => {
    const urlItem = node.querySelector('a')?.getAttribute('href') ?? '';
    const url = new URL(urlItem);
    const { origin, pathname } = url;
    const urlAd = `${origin}${pathname}`;
    const itemIdAd = pathname.replace(/\D/g, '');
    const titleAd = node.querySelector(TITLE_AD_SELECTOR)?.textContent ?? '';
    const descriptionAd = `${
      node.querySelector(DESCRIPTION_AD_SELECTOR)?.textContent
    }, ${node.querySelector(DESCRIPTION_YEAR_AD_SELECTOR)?.textContent}, ${
      node.querySelector(DESCRIPTION_MILEAGE_AD_SELECTOR)?.textContent
    }`;
    const imgUrlAd =
      node
        .querySelector(IMAGE_URL_AD_SELECTOR)
        ?.getAttribute('data-testid')
        ?.replace('segment-', '') ?? 'assets/no-photo.webp';
    const priceAd = Array.from(node.querySelectorAll(PRICE_AD_SELECTOR))
      .map((e) => e.textContent?.replace(/[*]/g, ''))
      .join(' / ');

    const isNotCompanyAd =
      !node.querySelector(COMPANY_AD_SELECTOR)?.textContent;

    if (isNotCompanyAd) {
      newAds[itemIdAd] = {
        img_url: imgUrlAd,
        id: itemIdAd,
        title: titleAd,
        description: descriptionAd,
        price: priceAd,
        url: urlAd,
        createAd: new Date().toLocaleDateString('ru-RU'),
      };
    }
  });

  return newAds;
}
