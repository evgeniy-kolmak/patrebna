import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { extractNextDataField } from 'config/lib/helpers/extractNextDataField';
import { type Request, type Response } from 'express';

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

export async function parseAdHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const adId = req.query.ad_id as string;
    if (!adId) {
      res.status(400).json({ error: 'Отсутствует параметр adId' });
      return;
    }
    const url = `https://www.kufar.by/item/${adId}`;
    const { data } = await axios.get<string>(url);
    const description: string | null = extractNextDataField(
      data,
      'props.initialState.adView.data.description',
    )
      .replace(/\n+/g, ' ')
      .trim();

    if (!description) {
      res.status(204).send();
      return;
    }
    res.json(description);
  } catch (error) {
    if (error instanceof AxiosError) {
      const { response, message, config } = error;
      res.status(response?.status ?? 400).json({
        error: message,
        details: config?.url,
      });
      console.error(`(${response?.status}) ${message} - ${config?.url}`);
    } else {
      res.status(500).json({
        error: 'Внутренняя ошибка сервера',
        details: String(error),
      });
      console.error('Unexpected error', error);
    }
  }
}
