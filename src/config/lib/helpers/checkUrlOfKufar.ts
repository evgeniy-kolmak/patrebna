import { api } from 'services/apiClient';
import { type IAd } from 'config/types';

export const checkUrlOfKufar = async (
  url: string,
): Promise<IAd[] | undefined> => {
  try {
    const encodedUrl = encodeURIComponent(url);
    const { data } = await api.get<IAd[]>(`ads?url=${encodedUrl}`);
    return data;
  } catch (error) {
    console.error('Ошибка при добавлении ссылки:', error);
  }
};
