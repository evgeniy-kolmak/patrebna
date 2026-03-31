import axios from 'axios';
import { type IAd } from 'config/types';

const HOST_API = process.env.HOST_API ?? '';

export const checkUrlOfKufar = async (
  url: string,
): Promise<IAd[] | undefined> => {
  try {
    const encodedUrl = encodeURIComponent(url);
    const { data } = await axios.get<IAd[]>(
      `https://${HOST_API}/api/ads?url=${encodedUrl}`,
    );
    return data;
  } catch (error) {
    console.error('Ошибка при добавлении ссылки:', error);
  }
};
