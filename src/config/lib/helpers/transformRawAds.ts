import { type RawAd, type IExtendedAd, AdParameters } from 'config/types';
import { getParametersOfAd } from 'config/lib/helpers/getParametersOfAd';
import { type InputMedia } from 'node-telegram-bot-api';

export function transformRawAds(rawAds: RawAd[]): IExtendedAd[] {
  const allImages: InputMedia[][] = rawAds.map(({ images }) => {
    if (!images.length) return [];

    return images.slice(0, 10).map(({ path, media_storage }) => ({
      type: 'photo',
      media: `https://${media_storage}.kufar.by/v1/list_thumbs_2x/${path}`,
    }));
  });

  const formatPrice = (value: string): string => {
    const num = Math.round(+value / 100);
    return new Intl.NumberFormat('ru-RU').format(num);
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
      title: subject.trim(),
      url: ad_link,
      img_url:
        allImages[index][0]?.media ?? 'https://i.ibb.co/NLkvZYG/no-photo.webp',
      images: allImages[index],
      price:
        price_byn !== '0' && price_usd !== '0'
          ? `${formatPrice(price_byn)}р. / ${formatPrice(price_usd)}$`
          : 'Договорная',
      region: getParametersOfAd(ad_parameters, AdParameters.Area)?.area,
      coordinates: getParametersOfAd(ad_parameters, AdParameters.Coordinates)
        ?.coordinates?.reverse()
        .map((item: number) => Number(item.toFixed(8))),
      ad_parameters: getParametersOfAd(ad_parameters, [
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
