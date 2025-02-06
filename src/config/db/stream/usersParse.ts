import cache from 'config/redis/redisService';
import { User } from 'config/db/models/User';
import { Profile } from 'config/db/models/Profile';
import { Premium } from 'config/db/models/Premium';
import { Parser } from 'config/db/models/Parser';
import { DataParser } from 'config/db/models/DataParser';
import { type ObjectId } from 'mongoose';
import {
  type IExtendedDataParserItem,
  type IDataParserItem,
  type UsersParserData,
  OperationType,
  StatusPremium,
} from 'config/types';
import { getUsers } from 'config/lib/helpers/getUsers';

export default (): void => {
  const changeStream = DataParser.watch();

  changeStream.on('change', (change) => {
    void (async () => {
      const TTL = 43200;
      const users = await getUsers();
      const changedId = change.documentKey._id as ObjectId;
      const parser = await Parser.findOne({ 'kufar.dataParser': changedId });
      const user = await User.findOne(
        { parser },
        { id: 1, profile: 1, _id: 0 },
      ).lean();

      if (!user) return;
      const userId = user?.id;

      const userProfile = await Profile.findOne(
        { _id: user?.profile },
        { premium: 1 },
      ).lean();
      const statusPremium = await Premium.findOne(
        { _id: userProfile?.premium },
        { status: 1 },
      ).lean();

      const operationType: OperationType = change.operationType;
      switch (operationType) {
        case OperationType.INSERT: {
          const data: UsersParserData = {
            [userId]: {
              urls: change.fullDocument.urls.map(
                ({ _id, ...rest }: IExtendedDataParserItem) => rest,
              ),
              status: statusPremium?.status ?? StatusPremium.NONE,
              referrals: [],
              canNotify: false,
            },
          };
          await cache.setCache('users', { ...users, ...data }, TTL);
          break;
        }
        case OperationType.UPDATE: {
          const urls: IDataParserItem[] =
            change.updateDescription.updatedFields.urls?.map(
              ({ _id, ...rest }: IExtendedDataParserItem) => rest,
            );
          users[userId] = {
            urls,
            status: statusPremium?.status ?? StatusPremium.NONE,
            referrals: [],
            canNotify: false,
          };
          await cache.setCache('users', { ...users }, TTL);
          break;
        }
        case OperationType.DELETE: {
          const { [userId]: _, ...updatedUsers } = users;
          await cache.setCache('users', updatedUsers, 43200);
          break;
        }
      }
    })();
  });
};
