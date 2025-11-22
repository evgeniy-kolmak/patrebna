import axios from 'axios';
import { type Request, type Response } from 'express';
import { extractNextDataField } from 'config/lib/helpers/extractNextDataField';
import { transformRawAds } from 'config/lib/helpers/transformRawAds';
import { type RawAd } from 'config/types';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount, error) => {
    console.warn(`Попытка #${retryCount} для ${error?.config?.url}`);
    return retryCount * 1000;
  },
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error);
  },
});

export async function parseAdsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const url = req.query.url as string;

    if (!url) {
      res.status(400).json({ error: 'Отсутствует параметр URL' });
      return;
    }

    const { data } = await axios.get<string>(url);

    const ads: RawAd[] | null = extractNextDataField(
      data,
      'props.initialState.listing.ads',
    );

    if (!ads) {
      res
        .status(500)
        .json({ error: 'Невозможно извлечь объявления из NEXT_DATA.' });
      return;
    }

    const transformed = transformRawAds(ads);
    res.json(transformed);
  } catch (error) {
    console.error('Ошибка parseAdsHandler:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      details: String(error),
    });
  }
}
