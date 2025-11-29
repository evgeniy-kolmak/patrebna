import axios from 'axios';
import { extractNextDataField } from 'config/lib/helpers/extractNextDataField';
import { type Request, type Response } from 'express';

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
    const description = extractNextDataField(
      data,
      'props.initialState.adView.data.description',
    )
      .replace(/\n+/g, ' ')
      .trim();

    if (!description) {
      res
        .status(500)
        .json({ error: 'Невозможно извлечь описание из NEXT_DATA.' });
      return;
    }
    res.json(description);
  } catch (error) {
    console.error('Ошибка parseAdsHandler:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      details: String(error),
    });
  }
}
