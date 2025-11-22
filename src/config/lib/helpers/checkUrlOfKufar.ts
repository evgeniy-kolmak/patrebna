import axios from 'axios';
import { type IAd } from 'config/types';

const HOST = process.env.HOST ?? '';

export const checkUrlOfKufar = async (
  url: string,
): Promise<IAd[] | undefined> => {
  try {
    const { data } = await axios.get<IAd[]>(`http://${HOST}:3000/api/ads`, {
      params: { url },
    });
    return data;
  } catch (error) {
    console.error('Ошибка при добавлении ссылки:', error);
  }
};
