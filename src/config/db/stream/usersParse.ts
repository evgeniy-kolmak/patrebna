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
      const operationType: OperationType = change.operationType;
      switch (operationType) {
        case OperationType.INSERT: {
          const urls: IDataParserItem[] = change.fullDocument.urls.map(
            ({ _id, ...rest }: IExtendedDataParserItem) => ({
              ...rest,
              ids: [],
            }),
          );
          userData.urls = urls;
          await cache.setCache(`user:${userId}`, { ...userData }, TTL);
          break;
        }
        case OperationType.UPDATE: {
          const urls: IDataParserItem[] =
            change.updateDescription.updatedFields.urls?.map(
              ({ _id, ...rest }: IExtendedDataParserItem) => ({
                ...rest,
                ids: [],
              }),
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
