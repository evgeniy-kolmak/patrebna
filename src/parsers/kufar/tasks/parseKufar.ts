import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import db from 'config/db/databaseServise';
import pLimit from 'p-limit';
import { pause } from 'config/lib/helpers/pause';
import { parserAds } from 'parsers';
import { type IProcessMessage, type IParserData } from 'config/types';

process.on('message', (message: IProcessMessage) => {
  void (async () => {
    const users = message.payload as Array<IParserData & { userId: number }>;
    try {
      await parseKufar(users);
      process.exit(0);
    } catch (err) {
      console.error('Ошибка парсера:', err);
      process.exit(1);
    }
  })();
});

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

async function parseKufar(
  users: Array<IParserData & { userId: number }>,
): Promise<void> {
  const limit = pLimit(10);
  const tasks = [];

  for (const user of users) {
    const { urls, userId } = user;
    if (!urls) continue;
    for (const { url, urlId, typeUrlParser } of urls.filter(
      ({ isActive }) => isActive,
    )) {
      tasks.push(
        limit(async () => {
          try {
            await pause(200);
            const { data } = await axios.get<string>(url);
            const ads = parserAds(typeUrlParser, data);
            if (!Array.isArray(ads) || !ads.length) return;
            const newAds = await db.addUniqueAds(userId, ads, urlId);
            process.send?.({
              type: 'newAds',
              payload: { user, newAds },
            });
          } catch (error) {
            if (error instanceof AxiosError) {
              const { response, message, config } = error;
              console.error(
                `(${response?.status}) ${message} - ${config?.url}`,
              );
            } else {
              console.error('Неизвестная ошибка:', error);
            }
          }
        }),
      );
    }
  }

  await Promise.all(tasks);
}
