import { ICollection, IAd } from '../../database';

export function parserRealOfEstate(
  items: NodeListOf<HTMLElement>,
): ICollection<IAd> {
  const newAds: ICollection<IAd> = {};

  items.forEach((node) => {
    const urlItem = node.querySelector('a')?.getAttribute('href') ?? '';
    const url = new URL(urlItem);
    const { origin, pathname } = url;
    const itemPath = url.pathname.split('/');
    const itemId = itemPath[itemPath.length - 1];
    const contentParent = node.querySelector('a')?.children[1];
    const imageParent = node.querySelector('a')?.children[0];
    const pathToImg =
      imageParent?.children[0].children[0].children[0].getAttribute(
        'data-src',
      ) ??
      imageParent?.children[0].children[0].children[0].children[0].children[0].children[0].children[0].getAttribute(
        'data-src',
      );
    newAds[itemId] = {
      img_url: pathToImg ?? 'dist/images/no-photo.png',
      id: itemId,
      title: contentParent?.children[3].textContent ?? '',
      price:
        contentParent?.children[0].children[0].children[0].textContent ?? '',
      url: `${origin}${pathname}`,
      createAd: new Date().toLocaleDateString('ru-RU'),
    };
  });
  return newAds;
}
