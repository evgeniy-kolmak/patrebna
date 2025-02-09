import { type Request, type Response } from 'express';

export async function bepaidWebhookHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const data = req.body;
    console.log('Получен вебхук:', data);

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Ошибка обработки вебхука:', error);
    res.status(400).json({ error: 'Invalid JSON' });
  }
}
