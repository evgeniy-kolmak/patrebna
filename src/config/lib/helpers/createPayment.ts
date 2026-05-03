import axios, { AxiosError } from 'axios';
import { type IOrder } from 'config/types';

interface CheckoutResponse {
  checkout: {
    token: string;
    redirect_url: string;
  };
}

export async function createPayment(
  { description, amount }: Pick<IOrder, 'description' | 'amount'>,
  trakingId: string,
  expired_at?: Date,
): Promise<string | undefined> {
  const storeId = process.env.STORE_ID;
  const bepaidApiKey = process.env.BEPAID_API_KEY;
  const HOST_API = process.env.HOST_API ?? '';
  const credentials = Buffer.from(`${storeId}:${bepaidApiKey}`).toString(
    'base64',
  );

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  try {
    const { data } = await axios.post<CheckoutResponse>(
      'https://checkout.bepaid.by/ctp/api/checkouts',
      {
        checkout: {
          transaction_type: 'payment',
          order: {
            description,
            amount,
            currency: 'BYN',
            tracking_id: trakingId,
            expired_at: (expired_at ?? expiresAt).toISOString(),
          },
          settings: {
            language: 'ru',
            notification_url: `https://${HOST_API}/api/bepaid`,
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`,
        },
      },
    );

    return data.checkout.redirect_url;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Ошибка при оплате подписки:', error.message);
    } else {
      console.error('Неизвестная ошибка:', error);
    }
  }
}
