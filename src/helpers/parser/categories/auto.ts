import { ICollection, IAd } from '../../database';

export function parserAuto(items: NodeListOf<HTMLElement>): ICollection<IAd> {
  const newAds: ICollection<IAd> = {};
  items.forEach((node) => {
    const urlItem = node.querySelector('a')?.getAttribute('href') ?? '';
    const url = new URL(urlItem);
    const { origin, pathname } = url;

    const itemId = url.pathname.split('/')[2];
    const contentParent = node.querySelector('a')?.children[1];
    const imageParent = node.querySelector('a')?.children[0];
    const titleAd = contentParent?.children[0].children[0];
    const priceAd = contentParent?.children[0].children[1];

    const isNotCompanyAd = contentParent?.children[1].children[0]?.textContent;

    if (!isNotCompanyAd) {
      newAds[itemId] = {
        img_url:
          `${imageParent?.children[0].children[0].children[0]?.getAttribute(
            'data-src',
          )}` ?? 'dist/images/no-photo.png',
        id: itemId,
        title:
          `${titleAd?.children[0].textContent} | ${titleAd?.children[2].textContent}` ??
          '',
        price:
          `${
            priceAd?.children[2].children[0].textContent
          } / ${priceAd?.children[2].children[1].textContent?.replace(
            /[*]/g,
            '',
          )}` ?? '',
        url: `${origin}${pathname}`,
        createAd: new Date().toLocaleDateString('ru-RU'),
      };
    }
  });

  return newAds;
}
