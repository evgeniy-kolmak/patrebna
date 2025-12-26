import { type RawAd, type IExtendedAd, AdParameters } from 'config/types';
import { getParametersOfAd } from 'config/lib/helpers/getParametersOfAd';

export function transformRawAds(rawAds: RawAd[]): IExtendedAd[] {
  const allImages: string[][] = rawAds.map(({ images }) => {
    if (!images.length) return [];

    return images
      .slice(0, 1)
      .map(
        ({ path, media_storage }) =>
          `https://${media_storage}.kufar.by/v1/list_thumbs_2x/${path}`,
      );
  });

  const formatPrice = (value: string): string => {
    const num = +value / 100;
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: num < 1 ? 1 : 0,
      maximumFractionDigits: num < 1 ? 2 : 0,
    }).format(num);
  };
  const extendedAds: IExtendedAd[] = rawAds.map(
    (
      {
        account_id,
        ad_id,
        subject,
        ad_link,
        price_byn,
        price_usd,
        ad_parameters,
        account_parameters,
      },
      index,
    ) => ({
      saller_id: account_id,
      saller_name: getParametersOfAd(
        account_parameters,
        AdParameters.NAME,
      )?.name.trim(),
      id: String(ad_id),
      title: subject.trim() ?? 'Без названия',
      url: ad_link,
      img_url: allImages[index][0] ?? 'https://i.ibb.co/NLkvZYG/no-photo.webp',
      price:
        price_byn !== '0' && price_usd !== '0'
          ? `${formatPrice(price_byn)}р. / ${formatPrice(price_usd)}$`
          : 'Договорная',
      region: getParametersOfAd(ad_parameters, AdParameters.Area)?.area,
      coordinates: getParametersOfAd(ad_parameters, AdParameters.Coordinates)
        ?.coordinates?.reverse()
        .map((item: number) => Number(item.toFixed(8))),
      parameters: getParametersOfAd(ad_parameters, [
        AdParameters.Сondition,
        AdParameters.Delivery,
        AdParameters.Safedeal,
        AdParameters.SquareMeter,
        AdParameters.Size,
        AdParameters.ReNumberFloors,
        AdParameters.Floor,
        AdParameters.YearBuilt,
        AdParameters.Rooms,
        AdParameters.Mileage,
        AdParameters.RegDate,
        AdParameters.CarsEngine,
        AdParameters.CarsType,
        AdParameters.CarsCapacity,
        AdParameters.CarsGearbox,
      ]),
    }),
  );
  return extendedAds;
}
