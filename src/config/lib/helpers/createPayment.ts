import axios, { AxiosError } from 'axios';
import { type IOrder } from 'config/types';

interface CheckoutResponse {
  checkout: {
    token: string;
    redirect_url: string;
  };
}

export async function createPayment(
  { description, amount }: IOrder,
  trakingId: string,
): Promise<string | undefined> {
  const storeId = process.env.STORE_ID;
  const bepaidApiKey = process.env.BEPAID_API_KEY;
  const WEBHOOK_HOST = process.env.WEBHOOK_HOST;
  const credentials = Buffer.from(`${storeId}:${bepaidApiKey}`).toString(
    'base64',
  );

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
          },
          settings: {
            language: 'ru',
            notification_url: `https://${WEBHOOK_HOST}/webhook/bepaid`,
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
    }
  }
}
