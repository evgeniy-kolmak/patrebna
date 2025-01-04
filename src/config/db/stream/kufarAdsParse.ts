import { User } from 'config/db/models/User';
import { Parser } from 'config/db/models/Parser';
import { KufarAd } from 'config/db/models/KufarAd';
import { pause } from 'config/lib/helpers/pause';
import { sendMessageOfNewAd } from 'config/lib/helpers/sendMessageOfNewAd';
import { type ObjectId } from 'mongoose';
import { type IAd, OperationType } from 'config/types';
import { getUsers } from 'config/lib/helpers/getUsers';
import cache from 'config/redis/redisService';

export default (): void => {
  const changeStream = KufarAd.watch();

  changeStream.on('change', (change) => {
    void (async () => {
      const changedId = change.documentKey._id as ObjectId;
      await pause(2000);
      const parser = await Parser.findOne({ 'kufar.kufarAds': changedId });
      const user = await User.findOne({ parser }, { _id: 0, id: 1 });
      const userId: number = user?.id;
      const { operationType } = change;
      switch (operationType) {
        case OperationType.INSERT: {
          try {
            const data: IAd = change.fullDocument;
            const users = await getUsers();
            if (users[userId].canNotify)
              await sendMessageOfNewAd({ userId, ...data });
          } finally {
            const users = await getUsers();
            users[userId].canNotify = true;
            await cache.setCache('users', { ...users }, 43200);
          }
          break;
        }
      }
    })();
  });
};
