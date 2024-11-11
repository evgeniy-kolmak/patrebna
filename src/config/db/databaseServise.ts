/* eslint-disable @typescript-eslint/explicit-function-return-type */
import mongoose from 'mongoose';
import { User } from 'config/db/models/User';
import { Profile } from 'config/db/models/Profile';
import { Parser } from 'config/db/models/Parser';
import { KufarAd } from 'config/db/models/KufarAd';
import { type IAd, type IProfile, type IUser } from 'config/types';
import { getTypeUrlParser } from 'config/lib/helpers/getTypeUrlParser';
import { checkUrlOfKufar } from 'config/lib/helpers/checkUrlOfKufar';
import { parseKufar } from 'config/lib/helpers/parseKufar';

class DatabaseService {
  url: string;
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
      tlsAllowInvalidCertificates: true,
      authSource: 'admin',
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
  }

  async getUsersForParse(): Promise<number[]> {
    const usersWithParsers = await User.find(
      {
        parsers: { $exists: true },
      },
      { id: 1, _id: 0 },
    );
    return usersWithParsers.map((user) => user.id);
  }

  async getInactiveUsers(): Promise<number[]> {
    const inactiveUsers = await User.find(
      {
        parsers: { $exists: false },
      },
      { id: 1, _id: 0 },
    );
    return inactiveUsers.map((user) => user.id);
  }

  async getUser(id: number) {
    const user = await User.findOne({ id });
    return user;
  }

  async setUser(data: IUser, id: number) {
    const profile = await Profile.create(data);
    const newUser = new User({
      id,
      profiles: profile._id,
    });
    await newUser.save();
    return newUser;
  }

  async removeUser(id: number) {
    const user = await this.getUser(id);
    if (!user) return null;
    const parser = await Parser.findOne(user.parsers?._id);
    if (user.parsers?._id) {
      const kufarObjectIds = parser?.kufar?.kufarAds;
      await KufarAd.deleteMany({
        _id: { $in: kufarObjectIds },
      });
      await parser?.deleteOne(user.parsers?._id);
    }
    await Profile.deleteOne(user.profiles?._id);
    await user.deleteOne({ id });
  }

  async getDataParser(id: number) {
    const user = await this.getUser(id);
    const parser = await Parser.findOne(user?.parsers?._id);
    return parser?.kufar?.dataParser;
  }

  async setUrlKufar(url: string, id: number) {
    const user = await this.getUser(id);
    const regex =
      /^(https?:\/\/(?:www\.)?(?:re\.|auto\.)?kufar\.by\/l)[\wа-яА-Я%-=&?.]*$/;
    if (!user) return null;
    if (url.match(regex)) {
      const dataUrl = await checkUrlOfKufar(url);
      if (dataUrl && typeof dataUrl === 'string') {
        const parser = await Parser.findOne(user.parsers?._id);
        const typeUrlParser = getTypeUrlParser(url);
        const dataParser = { url, typeUrlParser };
        const data = { kufar: { dataParser } };
        if (!user.parsers?._id) {
          const parser = await Parser.create(data);
          user.parsers = parser._id;
          await user.save();
        } else if (parser?.kufar) {
          if (parser.kufar.kufarAds.length) {
            const kufarObjectIds = parser.kufar.kufarAds;
            await KufarAd.deleteMany({
              _id: { $in: kufarObjectIds },
            });
            await Parser.updateMany(
              { _id: parser._id },
              {
                $set: { 'kufar.kufarAds': [] },
              },
            );
          }
          parser.kufar.dataParser = dataParser;
          await parser.save();
        } else {
          console.error('Не удалось добавить ссылку Kufar!');
          return new Error();
        }
        await parseKufar(dataUrl, id, typeUrlParser);
      } else {
        console.error('Неподходящая ссылка Kufar!');
        return new Error();
      }
    } else {
      return new Error();
    }
  }

  async getSavedIds(id: number) {
    const user = await this.getUser(id);
    if (!user) return null;
    const parser = await Parser.findOne(user?.parsers?._id);
    const adIds = await KufarAd.find(
      { _id: { $in: parser?.kufar?.kufarAds } },
      { id: 1, _id: 0 },
    );
    const ids = adIds.map((ad) => ad.id);
    return ids;
  }

  async setAdKufar(data: IAd, id: number) {
    const user = await this.getUser(id);
    if (!user) return null;
    const parser = await Parser.findOne(user?.parsers?._id);
    const newAd = await KufarAd.create(data);
    if (user && parser?.kufar?.kufarAds) {
      parser.kufar?.kufarAds.push(newAd._id);
      await parser.save();
      return newAd;
    }
  }

  async getProfile(id: number) {
    const user = await this.getUser(id);
    if (!user) return null;
    const profile = await Profile.findOne(user.profiles?._id);
    const parser = await Parser.findOne(user.parsers?._id);
    const dataProfile: IProfile = Object.assign(profile as IUser);
    if (user.parsers?._id) {
      dataProfile.link = parser?.kufar?.dataParser?.url;
      dataProfile.count_ads = parser?.kufar?.kufarAds.length;
    }

    return dataProfile;
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
