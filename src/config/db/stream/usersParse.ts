import cache from 'config/redis/redisService';
import { User } from 'config/db/models/User';
import { Parser } from 'config/db/models/Parser';
import { DataParser } from 'config/db/models/DataParser';
import { type ObjectId } from 'mongoose';
import {
  type IExtendedDataParserItem,
  type IDataParserItem,
  OperationType,
  type IParserData,
} from 'config/types';

import { getUser } from 'config/lib/helpers/getUser';
import { TelegramService } from 'config/telegram/telegramServise';
import { getUserIds } from 'config/lib/helpers/getUserIds';
import { pause } from 'config/lib/helpers/pause';

export default (): void => {
  const changeStream = DataParser.watch();

  changeStream.on('change', (change) => {
    void (async () => {
      const TTL = 43200;
      const changedId = change.documentKey._id as ObjectId;
      const parser = await Parser.findOne({ 'kufar.dataParser': changedId });
      const user = await User.findOne(
        { parser },
        { id: 1, profile: 1, _id: 0 },
      ).lean();

      if (!user) return;
      const userId = user?.id;
      const userData: IParserData = await getUser(userId);
      const processedInserts = new Set<number>();
      const operationType: OperationType = change.operationType;
      switch (operationType) {
        case OperationType.INSERT: {
          if (processedInserts.has(userId)) return;
          processedInserts.add(userId);
          await pause(2000);
          processedInserts.delete(userId);
          const users = await getUserIds();
          const urls: IDataParserItem[] = change.fullDocument.urls.map(
            ({ _id, ...rest }: IExtendedDataParserItem) => rest,
          );
          userData.urls = urls;
          await cache.setCache(`user:${userId}`, { ...userData }, TTL);
          await TelegramService.sendMessageToChat(
            `${[
              `🙍 Пользователь с id: <b>${userId}</b> присоединился к боту`,
              `👥 Всего пользователей: <b>${users.length}</b>
              `,
            ].join('\n')}`,
          );
          break;
        }
        case OperationType.UPDATE: {
          const urls: IDataParserItem[] =
            change.updateDescription.updatedFields.urls?.map(
              ({ _id, ...rest }: IExtendedDataParserItem) => rest,
            );
          userData.urls = urls;
          await cache.setCache(`user:${userId}`, { ...userData }, TTL);
          break;
        }
        case OperationType.DELETE: {
          const cacheUsers = await cache.getCache('userIds');
          if (cacheUsers) {
            const users: number[] = JSON.parse(cacheUsers);
            const filteredUsers = users.filter((id) => id !== userId);
            await cache.setCache('ids', filteredUsers, TTL);
          }
          await cache.removeCache(`user:${userId}`);
          break;
        }
      }
    })();
  });
};
