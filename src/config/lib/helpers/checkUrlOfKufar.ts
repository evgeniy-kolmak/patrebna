import axios, { AxiosError } from 'axios';

export const checkUrlOfKufar = async (
  url: string,
): Promise<string | number | null> => {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.status ?? 404;
    } else {
      console.error('Неизвестная ошибка:', error);
    }
  }
  return null;
};
