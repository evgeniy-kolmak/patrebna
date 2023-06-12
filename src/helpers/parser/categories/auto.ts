import { ICollection, IAd } from '../../database';

export function parserAuto(items: NodeListOf<Element>): ICollection<IAd> {
  const newAds: ICollection<IAd> = {};

  items.forEach((node) => {
    const urlItem = node.querySelector('a')?.getAttribute('href') ?? '';
    const url = new URL(urlItem);
    const { origin, pathname } = url;
    const urlAd = `${origin}${pathname}`;
    const itemIdAd = url.pathname.split('/')[2];
    const titleAd =
      node.querySelector('h3[class^="styles_title__"]')?.textContent ?? '';
    const descriptionAd = `${
      node.querySelector('p[class^="styles_params__"]')?.textContent
    }, ${node.querySelector('div[class^="styles_year__"]')?.textContent} год, ${
      node.querySelector('div[class^="styles_mileage__"]')?.textContent
    }`;
    const imgUrlAd =
      node
        .querySelector('img[class^="styles_image__"]')
        ?.getAttribute('data-src') ?? 'assets/no-photo.webp';
    const priceAd = Array.from(
      node.querySelectorAll('div[class^=styles_price__] > span'),
    )
      .map((e) => e.textContent?.replace(/[*]/g, ''))
      .join(' / ');

    const isNotCompanyAd = !node.querySelector('div[class^="styles_badge__"]')
      ?.textContent;

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
