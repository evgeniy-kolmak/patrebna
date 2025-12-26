/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'dotenv/config';
import mongoose, { type ObjectId } from 'mongoose';
import { User } from 'config/db/models/User';
import { Profile } from 'config/db/models/Profile';
import { Parser } from 'config/db/models/Parser';
import { KufarAd } from 'config/db/models/KufarAd';
import { DataParser } from 'config/db/models/DataParser';
import { Premium } from 'config/db/models/Premium';
import { Activity } from 'config/db/models/Activity';
import {
  type IAd,
  type IProfile,
  type IDataParserItem,
  type IExtendedDataParserItem,
  StatusPremium,
  type IParserData,
} from 'config/types';
import { checkUrlOfKufar } from 'config/lib/helpers/checkUrlOfKufar';
import dataParserStream from 'config/db/stream/usersParse';
import cache from 'config/redis/redisService';
import { getUser } from 'config/lib/helpers/getUser';
import { TelegramService } from 'config/telegram/telegramServise';

class DatabaseService {
  private readonly url: string;
  private readonly TTL: number;
  constructor() {
    this.TTL = 43200;
    this.url = `mongodb://mongodb:27017/`;
  }

  async openConnection() {
    const username = process.env.MONGO_INITDB_ROOT_USERNAME ?? '';
    const password = process.env.MONGO_INITDB_ROOT_PASSWORD ?? '';

    const connect = mongoose.connection;
    connect.on(
      'error',
      console.error.bind(console, 'Ошибка подключения к базе данных:'),
    );
    connect.once('open', () => {
      console.log('Успешное подключение к базе данных.');
      dataParserStream();
    });

    await mongoose.connect(this.url, {
      auth: {
        username,
        password,
      },
      tls: true,
      dbName: 'patrebna',
      authSource: 'admin',
      replicaSet: 'rs0',
      tlsAllowInvalidCertificates: true,
      tlsCertificateKeyFile: './certs/client.pem',
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
    });
  }

  async getUser(id: number) {
    const user = await User.findOne({ id });
    if (!user) return null;
    return user;
  }

  async getProfile(id: number) {
    const user = await this.getUser(id);
    return await Profile.findOne(user?.profile?._id);
  }

  async getParser(id: number) {
    const user = await this.getUser(id);
    return await Parser.findOne(user?.parser?._id).populate('kufar');
  }

  async getDataParser(id: number) {
    const parser = await this.getParser(id);
    const dataParserId = parser?.kufar?.dataParser?._id;
    if (!dataParserId) return;
    return await DataParser.findOne(dataParserId);
  }

  async getDataPremium(id: number) {
    const profile = await this.getProfile(id);
    return await Premium.findOne({ _id: profile?.premium?._id }).lean();
  }

  async expirePremium() {
    const now = new Date();
    const expiredUsers = (await User.find()
      .select('-_id id')
      .populate({
        path: 'profile',
        select: '-_id premium',
        populate: {
          path: 'premium',
          match: {
            status: StatusPremium.ACTIVE,
            end_date: { $lte: now },
          },
        },
      })
      .lean()) as unknown as Array<{
      id: number;
      profile: { premium: { status: string } | null };
    }>;
    const expiredUserIds = expiredUsers
      .filter((user) => user.profile?.premium !== null)
      .map((user) => user.id);

    for (const userId of expiredUserIds) {
      const user = await getUser(userId);
      await cache.setCache(
        `user:${userId}`,
        { ...user, status: StatusPremium.EXPIRED },
        this.TTL,
      );
      const dataParser = await this.getDataParser(userId);
      if (!dataParser) continue;
      const updatedUrls = dataParser.urls.map((url) => {
        if (url.urlId !== 1 && url.isActive) {
          return {
            ...url.toObject(),
            isActive: false,
          };
        }
        return url;
      });

      await DataParser.findOneAndUpdate(
        { _id: dataParser?._id },
        { $set: { urls: updatedUrls } },
      );
    }

    await Premium.updateMany(
      { status: StatusPremium.ACTIVE, end_date: { $lte: now } },
      { $set: { status: StatusPremium.EXPIRED } },
    );

    return expiredUserIds;
  }

  async expirePremiumSoon() {
    const oneDayLater = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const usersWithPremiumEndingSoon = (await User.find()
      .select('-_id id')
      .populate({
        path: 'profile',
        select: '-_id premium',
        populate: {
          path: 'premium',
          match: {
            status: StatusPremium.ACTIVE,
            end_date: { $lte: oneDayLater },
          },
        },
      })
      .lean()) as unknown as Array<{
      id: number;
      profile: { premium: { status: string } | null };
    }>;
    return usersWithPremiumEndingSoon
      .filter((user) => user.profile?.premium !== null)
      .map((user) => user.id);
  }

  async grantPremium(userId: number, days: number) {
    const premium = await this.getDataPremium(userId);
    const user = await getUser(userId);
    const now = new Date();
    const endDate =
      premium?.end_date && premium.end_date > now
        ? new Date(premium.end_date)
        : now;
    endDate.setDate(endDate.getDate() + days);

    await Premium.findOneAndUpdate(
      { _id: premium?._id },
      {
        status: StatusPremium.ACTIVE,
        end_date: endDate,
      },
      { upsert: true, new: true },
    );

    await cache.setCache(
      `user:${userId}`,
      { ...user, status: StatusPremium.ACTIVE },
      this.TTL,
    );
  }

  async rewardForChannelSubscription(userId: number) {
    const profile = await this.getProfile(userId);
    await Profile.updateMany(
      { _id: profile?._id },
      { $set: { subscribeToChannel: true } },
    );
    await Activity.updateOne(
      {},
      { $addToSet: { userIdsSubscribedToChannel: userId } },
      { upsert: true },
    );
    await this.grantPremium(userId, 7);
    await this.incrementWallet(userId, 10);
  }

  async isChannelSubscriptionRewarded(userId: number) {
    const userProfile = await this.getProfile(userId);
    const [profile, activity] = await Promise.all([
      Profile.exists({ _id: userProfile?._id, subscribeToChannel: true }),
      Activity.exists({ userIdsSubscribedToChannel: userId }),
    ]);

    return Boolean(profile && activity);
  }

  async isUserBlocked(userId: number) {
    return await Activity.exists({ blacklist: userId });
  }

  async getUsersForParse() {
    return (await User.find()
      .select('-_id id')
      .populate({
        path: 'parser',
        select: '-_id kufar.dataParser',
      })
      .lean()) as unknown as Array<{
      id: number;
      parser: { kufar: { dataParser: ObjectId } };
    }>;
  }

  async getUserForParse(userId: number): Promise<IParserData> {
    const premium = await this.getDataPremium(userId);
    const dataParser = await this.getDataParser(userId);
    const extendedUrls: IExtendedDataParserItem[] = dataParser?.urls.toObject();
    const urls = extendedUrls?.map(
      ({ _id, ...rest }) => rest as IDataParserItem,
    );
    return {
      urls,
      status: premium?.status ?? StatusPremium.NONE,
      canNotify: true,
    };
  }

  async setUser(id: number, data: IProfile) {
    const { premium, ...rest } = data;
    const subscription = await Premium.create({ status: premium.status });
    const profile = await Profile.create({
      ...rest,
      premium: subscription._id,
    });
    const parser = await Parser.create({});
    const newUser = await User.create({
      id,
      profile: profile._id,
      parser: parser._id,
    });
    await Activity.updateOne(
      {},
      { $addToSet: { alreadyRegisteredUserIds: id } },
      { upsert: true },
    );
    await TelegramService.sendMessageToChat(
      `${[
        `🙍 Пользователь с id: <b>${id}</b> присоединился к боту`,
        `👥 Всего пользователей: <b>${(await User.find({})).length}</b>`,
      ].join('\n')}`,
    );
    return newUser;
  }

  async removeUser(id: number) {
    const user = await this.getUser(id);
    if (user) {
      const parser = await this.getParser(id);
      const profile = await this.getProfile(id);
      const dataParser = await this.getDataParser(id);
      const kufarObjectIds = parser?.kufar?.kufarAds;
      await KufarAd.deleteMany({ _id: { $in: kufarObjectIds } });
      await User.deleteOne({ id });
      if (profile) {
        await Premium.deleteOne(profile?.premium?._id);
        await Profile.deleteOne(profile?._id);
      }
      if (parser) await Parser.deleteOne(parser?._id);
      if (dataParser) await DataParser.deleteOne(dataParser?._id);

      await cache.removeCache(`user:${id}`);
      const cacheLanguages = await cache.getCache('languages');
      const cacheUsers = await cache.getCache('ids');
      if (cacheLanguages) {
        const parsedLanguages = JSON.parse(cacheLanguages);
        if (parsedLanguages[id]) {
          const { [id]: _, ...updatedLanguages } = parsedLanguages;
          await cache.setCache('languages', updatedLanguages, this.TTL);
        }
      }
      if (cacheUsers) {
        const userIds: number[] = JSON.parse(cacheUsers);
        const filteredUsers = userIds.filter((userId) => userId !== id);
        await cache.setCache('ids', filteredUsers, this.TTL);
        await TelegramService.sendMessageToChat(
          `${[
            `🗑️ Пользователь с id: <b>${id}</b> был удален`,
            `👥 Всего пользователей: <b>${(await User.find({})).length}</b>`,
          ].join('\n')}`,
        );
      }
      console.error(`Заблокированный пользователь c ID:${id} был удален!`);
    } else console.error(`Пользователь c ID:${id} не был найден.`);
  }

  async setUrlKufar(userId: number, url: string, urlId: number) {
    const regex =
      /^(https?:\/\/(?:www\.)?(?:re\.|auto\.)?kufar\.by\/l)[\wа-яА-Я\-_.~!*'();/?:@&=+$,%]*$/;

    if (!url.match(regex)) return new Error();

    const dataUrl = await checkUrlOfKufar(url);
    if (!dataUrl) return new Error();

    const parser = await this.getParser(userId);
    const dataParser = await this.getDataParser(userId);

    const dataParserItem: IDataParserItem = {
      urlId,
      url,
      isActive: true,
    };

    if (!dataParser) {
      const newDataParser = await DataParser.create({ urls: [dataParserItem] });
      await parser?.updateOne({ 'kufar.dataParser': newDataParser._id });
    } else {
      const updatedUrls = dataParser.urls.map((u) =>
        u.urlId === urlId ? dataParserItem : u,
      );

      if (!dataParser.urls.some((u) => u.urlId === urlId)) {
        updatedUrls.push(dataParserItem);
      }

      await DataParser.updateOne(
        { _id: dataParser._id },
        { $set: { urls: updatedUrls } },
      );

      if (dataParser.urls.some((u) => u.urlId === urlId)) {
        await this.removeKufarAdsByUrlId(userId, urlId);
      }
    }

    await this.addUniqueAds(userId, dataUrl, urlId);
    return dataUrl.length;
  }

  async toggleUrlStatus(userId: number, urlId: number) {
    const dataParser = await this.getDataParser(userId);
    const urls = dataParser?.urls.map((url) => {
      if (url.urlId === urlId) {
        return {
          ...url.toObject(),
          isActive: !url.isActive,
        };
      }
      return url;
    });

    const updatedParser = await DataParser.findOneAndUpdate(
      { _id: dataParser?._id },
      { $set: { urls } },
      { new: true },
    );
    const updatedUrl = updatedParser?.urls.find((url) => url.urlId === urlId);
    return updatedUrl?.isActive;
  }

  async getUrlInformation(userId: number, urlId: number) {
    const dataParser = await this.getDataParser(userId);
    const parser = await db.getParser(userId);
    const currentUrl = dataParser?.urls.find((url) => url.urlId === urlId);
    const currentAds = parser?.kufar?.kufarAds.find(
      (url) => url.urlId === urlId,
    );
    return {
      url: decodeURIComponent(currentUrl?.url ?? ''),
      statusUrl: currentUrl?.isActive,
      numberOfAds: currentAds?.ads.length,
    };
  }

  async removeUrlKufar(userId: number, urlId: number) {
    const dataParser = await this.getDataParser(userId);
    const statusPremium = await this.getDataPremium(userId);
    if (!dataParser) return;

    const urls = dataParser.urls
      .filter((url) => url.urlId !== urlId)
      .map((url, index) => ({
        urlId:
          statusPremium?.status === StatusPremium.ACTIVE
            ? index + 1
            : url.urlId,
        url: url.url,
        isActive: url.isActive,
        _id: url._id,
      }));

    if (!urls.length) {
      await DataParser.deleteOne({ _id: dataParser._id });
      await Parser.updateMany(
        { 'kufar.dataParser': dataParser._id },
        { $unset: { 'kufar.dataParser': '' } },
      );
    } else
      await DataParser.updateOne({ _id: dataParser._id }, { $set: { urls } });

    await this.removeKufarAdsByUrlId(userId, urlId);

    const updatedParser = await this.getParser(userId);

    await Parser.updateOne(
      { _id: updatedParser?._id },
      {
        $set: {
          'kufar.kufarAds': updatedParser?.kufar?.kufarAds.map((ad, index) => ({
            ...ad.toObject(),
            urlId:
              statusPremium?.status === StatusPremium.ACTIVE
                ? index + 1
                : ad.urlId,
          })),
        },
      },
    );
  }

  async addUniqueAds(id: number, parseAds: IAd[], urlId: number) {
    const parser = await this.getParser(id);
    const existingAds = await KufarAd.find(
      { _id: { $in: parser?.kufar?.kufarAds.flatMap((item) => item.ads) } },
      { id: 1, _id: 0 },
    );
    const existingIds = existingAds.map((ad) => ad.id);
    const newAds = parseAds.filter((ad) => !existingIds.includes(ad.id));
    if (!newAds.length) return [];
    const createdAds = await KufarAd.insertMany(newAds);
    const ads = createdAds.map((ad) => ad._id);
    const existingKufarAds = parser?.kufar?.kufarAds.find(
      (item) => item.urlId === urlId,
    );
    existingKufarAds
      ? existingKufarAds.ads.push(...ads)
      : parser?.kufar?.kufarAds.push({ urlId, ads });
    await parser?.save();
    return newAds;
  }

  async removeKufarAdsByUrlId(userId: number, urlId: number) {
    const parser = await this.getParser(userId);
    const removedAds = parser?.kufar?.kufarAds.filter(
      (ad) => ad.urlId === urlId,
    );
    const updatedKufarAds = parser?.kufar?.kufarAds.filter(
      (ad) => ad.urlId !== urlId,
    );
    await Parser.updateOne(
      { _id: parser?._id },
      { $set: { 'kufar.kufarAds': updatedKufarAds } },
    );

    if (removedAds) {
      const kufarObjectIds = removedAds[0]?.ads;
      await KufarAd.deleteMany({
        _id: { $in: kufarObjectIds },
      });
    }
  }

  async getWallet(userId: number) {
    const profile = await this.getProfile(userId);
    return profile?.wallet ?? 0;
  }

  async incrementWallet(userId: number, amount: number) {
    const profile = await this.getProfile(userId);
    if (!profile) return;
    const newAmount = Number((profile.wallet + amount).toFixed(1));
    await Profile.updateOne(
      { _id: profile._id },
      { $set: { wallet: newAmount } },
    );
  }

  async tryAddReferralWithBonus(userId: number, referrerId: number) {
    const profile = await this.getProfile(referrerId);
    const activity = await Activity.exists({
      alreadyRegisteredUserIds: userId,
    });
    if (activity) return;
    const result = await Profile.updateOne(
      { _id: profile?._id },
      { $addToSet: { referrals: userId } },
    );

    if (result.matchedCount) {
      await this.grantPremium(referrerId, 3);
      await this.incrementWallet(referrerId, 3);
    }
  }

  async clearExpiredAdReferences() {
    const activeAdIds = await KufarAd.find({}, '_id').then((ads) =>
      ads.map((ad) => ad._id),
    );

    await Parser.updateMany(
      {},
      { $pull: { 'kufar.kufarAds.$[].ads': { $nin: activeAdIds } } },
    );
  }
}

const db = new DatabaseService();
export default db;
