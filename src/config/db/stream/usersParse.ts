import { User } from 'config/db/models/User';
import { Parser } from 'config/db/models/Parser';
import { DataParser } from 'config/db/models/DataParser';
import { type ObjectId } from 'mongoose';
import {
  type IExtendedDataParserItem,
  OperationType,
  type IDataParserItem,
  type UsersParserData,
} from 'config/types';
import cache from 'config/redis/redisService';
import { getUsers } from 'config/lib/helpers/getUsers';

export default (): void => {
  const changeStream = DataParser.watch();

  changeStream.on('change', (change) => {
    void (async () => {
      const TTL = 43200;
      const users = await getUsers();
      const changedId = change.documentKey._id as ObjectId;
      const parser = await Parser.findOne({ 'kufar.dataParser': changedId });
      const user = await User.findOne({ parser }, { _id: 0, id: 1 });
      const userId: number = user?.id;
      const operationType: OperationType = change.operationType;
      switch (operationType) {
        case OperationType.INSERT: {
          const data: UsersParserData = {
            [userId]: {
              urls: change.fullDocument.urls.map(
                ({ _id, ...rest }: IExtendedDataParserItem) => rest,
              ),
              referrals: [],
              canNotify: false,
            },
          };
          await cache.setCache('users', { ...users, ...data }, TTL);
          break;
        }
        case OperationType.UPDATE: {
          const urls: IDataParserItem[] = [
            change.updateDescription.updatedFields.urls.map(
              ({ _id, ...rest }: IExtendedDataParserItem) => rest,
            ),
          ];
          users[userId] = { urls, referrals: [], canNotify: false };
          await cache.setCache('users', { ...users }, TTL);
          break;
        }
      }
    })();
  });
};
