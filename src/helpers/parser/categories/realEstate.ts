import { IAd, ICollection } from '../../tasks/parseKufar';

export function parserRealOfEstate(
  items: NodeListOf<Element>,
): ICollection<IAd> {
  const newAds: ICollection<IAd> = {};

  items.forEach((node) => {
    const urlItem = node.querySelector('a')?.getAttribute('href') ?? '';
    const url = new URL(urlItem);
    const { origin, pathname } = url;
    const urlAd = `${origin}${pathname}`;
    const itemPath = url.pathname.split('/');
    const itemIdAd = itemPath[itemPath.length - 1];
    const titleAd =
      node.querySelector('div[class^="styles_parameters"]')?.textContent ?? '';
    const descriptionAd =
      node.querySelector('p[class^="styles_body__"]')?.textContent ?? '';
    const priceAd = Array.from(
      node.querySelectorAll('span[class^=styles_price__]'),
    )
      .map((e) => e.textContent?.replace(/[*]/g, ''))
      .join(' / ');
    const imgUrlAd =
      node
        .querySelector('div[class^=styles_segment__]')
        ?.getAttribute('data-testid')
        ?.slice(8) ?? 'assets/no-photo.webp';

    newAds[itemIdAd] = {
      img_url: imgUrlAd,
      id: itemIdAd,
      title: titleAd,
      price: priceAd,
      url: urlAd,
      description: descriptionAd,
      createAd: new Date().toLocaleDateString('ru-RU'),
    };
  });
  return newAds;
}
