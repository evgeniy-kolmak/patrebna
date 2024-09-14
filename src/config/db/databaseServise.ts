/* eslint-disable @typescript-eslint/explicit-function-return-type */
import mongoose from 'mongoose';
import { User } from 'config/db/models/User';
import { Profile } from 'config/db/models/Profile';
import { Parser } from 'config/db/models/Parser';
import { KufarAd } from 'config/db/models/KufarAd';
import { type IAd, type IProfile, type IUser } from 'config/types';
import { getTypeUrlParser } from 'config/lib/helpers/getTypeUrlParser';

class DatabaseService {
  url: string;
  constructor() {
    this.url = 'mongodb://localhost:27017/patrebna';
    void mongoose.connect(this.url);

    const connect = mongoose.connection;

    connect.on(
      'error',
      console.error.bind(console, 'Error connecting to MongoDB:'),
    );
    connect.once('open', () => {
      console.log('Connected to MongoDB successfully!');
    });
  }

  async getUserForParse() {
    const usersWithParsers = await User.find({
      parsers: { $exists: true },
    });
    return usersWithParsers.map((user) => user.id);
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

  async isAdsEmpty(id: number) {
    const user = await this.getUser(id);
    const parser = await Parser.findOne(user?.parsers?._id);
    return parser?.kufar?.kufarAds.length;
  }

  async getDataParser(id: number) {
    const user = await this.getUser(id);
    const parser = await Parser.findOne(user?.parsers?._id);
    return parser?.kufar?.dataParser;
  }

  async setUrlKufar(url: string, id: number) {
    const user = await this.getUser(id);
    const regex =
      /^(https?:\/\/(?:www\.)?(?:re\.|auto\.)?kufar\.by)\/?[^а-яА-Я\s]*$/;
    if (!user) return null;
    if (url.match(regex)) {
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
    } else {
      return new Error();
    }
  }

  async getSavedAds(id: number) {
    const user = await this.getUser(id);
    if (!user) return null;
    const parser = await Parser.findOne(user?.parsers?._id);
    const ads = await KufarAd.find({ _id: { $in: parser?.kufar?.kufarAds } });
    return ads;
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
}

const db = new DatabaseService();
export default db;
