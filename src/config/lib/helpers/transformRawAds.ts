import { type RawAd, type IExtendedAd, AdParameters } from 'config/types';
import { getParametersOfAd } from 'config/lib/helpers/getParametersOfAd';
import { type InputMedia } from 'node-telegram-bot-api';

export function transformRawAds(rawAds: RawAd[]): IExtendedAd[] {
  const defaultImage = process.env.DEFAULT_IMAGE_URL ?? '';
  const allImages: InputMedia[][] = rawAds.map(({ images }) =>
    images.slice(0, 10).map(({ path, media_storage }) => ({
      type: 'photo',
      media: `https://${media_storage}.kufar.by/v1/list_thumbs_2x/${path}`,
    })),
  );

  const formatPrice = (value: string): string => {
    const num = Math.round(+value / 100);
    return new Intl.NumberFormat('ru-RU').format(num);
  };
  const extendedAds: IExtendedAd[] = rawAds.map(
    (
      { ad_id, subject, ad_link, price_byn, price_usd, ad_parameters },
      index,
    ) => ({
      id: String(ad_id),
      title: subject.trim(),
      url: ad_link,
      img_url: allImages[index][0]?.media ?? defaultImage,
      images: allImages[index],
      price: `${formatPrice(price_byn)}р. / ${formatPrice(price_usd)}$`,
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
