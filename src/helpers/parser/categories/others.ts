import { ICollection, IAd } from '../../database';

export function parserOthers(items: NodeListOf<HTMLElement>): ICollection<IAd> {
  const newAds: ICollection<IAd> = {};
  items.forEach((node) => {
    const isNotCompanyAd = node.querySelector(
      'a div ~ div h3 ~ div > div > div',
    )?.textContent;
    if (!isNotCompanyAd) {
      const urlItem = node.querySelector('a')?.getAttribute('href') ?? '';
      const url = new URL(urlItem);
      const { origin, pathname } = url;
      const itemId = url.pathname.split('/')[2];

      newAds[itemId] = {
        img_url:
          node
            .querySelector(`a > div > div > div > div > div > img`)
            ?.getAttribute('data-src') ?? 'dist/images/no-photo.png',
        id: itemId,
        title: node.querySelector('a > div > h3')?.textContent?.trim() ?? '',
        price: node.querySelector('a > div ~ div > div')?.textContent ?? '',
        url: `${origin}${pathname}`,
        createAd: new Date().toLocaleDateString('ru-RU'),
      };
    }
  });
  return newAds;
}
