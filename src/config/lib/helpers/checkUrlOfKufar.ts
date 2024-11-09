import axios, { AxiosError } from 'axios';

export const checkUrlOfKufar = async (
  url: string,
): Promise<string | number | null> => {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.status ?? 404;
    } else {
      console.log(error);
    }
  }
  return null;
};
