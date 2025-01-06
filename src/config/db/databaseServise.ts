/* eslint-disable @typescript-eslint/explicit-function-return-type */
import mongoose from 'mongoose';
import { User } from 'config/db/models/User';
import { Profile } from 'config/db/models/Profile';
import { Parser } from 'config/db/models/Parser';
import { KufarAd } from 'config/db/models/KufarAd';
import { DataParser } from 'config/db/models/DataParser';
import {
  type UsersParserData,
  type IAd,
  type IProfile,
  type IDataParserItem,
  type IExtendedDataParserItem,
} from 'config/types';
import { getTypeUrlParser } from 'config/lib/helpers/getTypeUrlParser';
import { checkUrlOfKufar } from 'config/lib/helpers/checkUrlOfKufar';
import dataParserStream from 'config/db/stream/usersParse';
import cache from 'config/redis/redisService';
import { parserAds } from 'parsers';
import { Premium } from './models/Premium';
import { getUsers } from 'config/lib/helpers/getUsers';

class DatabaseService {
  private readonly url: string;
  constructor() {
    const username = process.env.MONGO_INITDB_ROOT_USERNAME ?? '';
    const password = process.env.MONGO_INITDB_ROOT_PASSWORD ?? '';
    this.url = `mongodb://mongodb:27017/`;
    void mongoose.connect(this.url, {
      auth: {
        username,
        password,
      },
      tls: true,
      dbName: 'patrebna',
      authSource: 'admin',
      tlsAllowInvalidCertificates: true,
      tlsCertificateKeyFile: './certs/client.pem',
    });

    const connect = mongoose.connection;

    connect.on(
      'error',
      console.error.bind(console, 'Error connecting to MongoDB:'),
    );
    connect.once('open', () => {
      console.log('Connected to MongoDB successfully!');
    });

    dataParserStream();
  }

  async getUser(id: number) {
    const user = await User.findOne({ id });
    if (!user) return null;
    return user;
  }

  async getProfile(id: number) {
    const user = await this.getUser(id);
    return await Profile.findOne(user?.profile?._id).populate('premium');
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

  async getUsersForParse() {
    const users = await User.find({}, { id: 1, _id: 0 });
    const userIds: number[] = users.map(({ id }) => id);
    const promises = userIds.map(async (id) => {
      const dataParser = await this.getDataParser(id);
      const extendedUrls: IExtendedDataParserItem[] =
        dataParser?.urls.toObject();
      const urls = extendedUrls.map(
        ({ _id, ...rest }) => rest as IDataParserItem,
      );
      return { id, urls };
    });

    return (await Promise.all(promises))
      .filter(Boolean)
      .reduce<UsersParserData>((acc, { id, urls }) => {
        acc[id] = { urls, canNotify: true, referrals: [] };
        return acc;
      }, {});
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
    await newUser.save();
    return newUser;
  }

  async removeUser(id: number) {
    const parser = await this.getParser(id);
    const profile = await this.getProfile(id);
    const dataParser = await this.getDataParser(id);
    const kufarObjectIds = parser?.kufar?.kufarAds;
    await KufarAd.deleteMany({ _id: { $in: kufarObjectIds } });
    await DataParser.deleteOne(dataParser?._id);
    await Parser.deleteOne(parser?._id);
    await Premium.deleteOne(profile?.premium?._id);
    await Profile.deleteOne(profile?._id);
    await User.deleteOne({ id });
    const users = await getUsers();
    const { [id]: _, ...updatedUsers } = users;
    await cache.setCache('users', { [id]: _, ...updatedUsers }, 43200);
  }

  async setUrlKufar(userId: number, url: string, urlId: number) {
    const regex =
      /^(https?:\/\/(?:www\.)?(?:re\.|auto\.)?kufar\.by\/l)[\wа-яА-Я\-_.~!*'();/?:@&=+$,%]*$/;
    if (url.match(regex)) {
      const dataUrl = await checkUrlOfKufar(url);
      if (dataUrl && typeof dataUrl === 'string') {
        const typeUrlParser = getTypeUrlParser(url);
        const parser = await this.getParser(userId);
        const dataParser = await this.getDataParser(userId);
        const dataParserItem: IDataParserItem = {
          urlId,
          url,
          typeUrlParser,
          isActive: true,
        };
        if (!dataParser) {
          const dataParser = await DataParser.create({
            urls: [{ ...dataParserItem }],
          });
          await parser?.updateOne({ kufar: { dataParser: dataParser._id } });
        } else {
          const kufarObjectIds = parser?.kufar?.kufarAds as [];
          await KufarAd.deleteMany({
            _id: { $in: kufarObjectIds },
          });
          await Parser.findOneAndUpdate(parser?._id, {
            $set: { 'kufar.kufarAds': [] },
          });
          await DataParser.findOneAndUpdate(dataParser?._id, {
            urls: [{ ...dataParserItem }],
          });
        }
        await this.addUniqueAds(userId, parserAds(typeUrlParser, dataUrl));
      } else {
        return new Error();
      }
    } else {
      return new Error();
    }
  }

  async addUniqueAds(id: number, parseAds: IAd[]) {
    const parser = await this.getParser(id);
    const existingAds = await KufarAd.find(
      { _id: { $in: parser?.kufar?.kufarAds } },
      { id: 1, _id: 0 },
    );
    const existingIds = existingAds.map((ad) => ad.id);
    const newAds = parseAds.filter((ad) => !existingIds.includes(ad.id));
    const createdAds = await KufarAd.insertMany(newAds);
    const newIds = createdAds.map((ad) => ad._id);
    parser?.kufar?.kufarAds.push(...newIds);
    await parser?.save();
    return newAds;
  }

  async clearExpiredAdReferences() {
    const activeAdIds = await KufarAd.find({}, '_id').then((ads) =>
      ads.map((ad) => ad._id),
    );
    await Parser.updateMany(
      {},
      { $pull: { 'kufar.kufarAds': { $nin: activeAdIds } } },
    );
  }
}

const db = new DatabaseService();
export default db;
