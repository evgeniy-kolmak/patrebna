import { ICollection, IAd } from '../../database';

export function parserOthers(items: NodeListOf<Element>): ICollection<IAd> {
  const newAds: ICollection<IAd> = {};

  items.forEach((node) => {
    const urlItem = node.querySelector('a')?.getAttribute('href') ?? '';
    const url = new URL(urlItem);
    const { origin, pathname } = url;
    const urlAd = `${origin}${pathname}`;
    const itemIdAd = url.pathname.split('/')[2];
    const titleAd =
      node.querySelector('h3[class^="styles_title__"]')?.textContent?.trim() ??
      '';
    const imgUrlAd =
      node
        .querySelector('img[class^="styles_image__"]')
        ?.getAttribute('data-src') ?? 'assets/no-photo.webp';
    const priceAd =
      node.querySelector('p[class^=styles_price__] span')?.textContent ?? '';
    const isNotCompanyAd = !node
      .querySelector('div[class^="styles_badge__"]')
      ?.textContent?.replace('.', '');

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
