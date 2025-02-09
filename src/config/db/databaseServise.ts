/* eslint-disable @typescript-eslint/explicit-function-return-type */
import mongoose from 'mongoose';
import { User } from 'config/db/models/User';
import { Profile } from 'config/db/models/Profile';
import { Parser } from 'config/db/models/Parser';
import { KufarAd } from 'config/db/models/KufarAd';
import { DataParser } from 'config/db/models/DataParser';
import { Premium } from 'config/db/models/Premium';
import {
  type UsersParserData,
  type IAd,
  type IProfile,
  type IDataParserItem,
  type IExtendedDataParserItem,
  StatusPremium,
} from 'config/types';
import { getTypeUrlParser } from 'config/lib/helpers/getTypeUrlParser';
import { checkUrlOfKufar } from 'config/lib/helpers/checkUrlOfKufar';
import dataParserStream from 'config/db/stream/usersParse';
import cache from 'config/redis/redisService';
import { parserAds } from 'parsers';
import { getUsers } from 'config/lib/helpers/getUsers';

class DatabaseService {
  private readonly url: string;
  constructor() {
    const username = process.env.MONGO_INITDB_ROOT_USERNAME ?? '';
    const password = process.env.MONGO_INITDB_ROOT_PASSWORD ?? '';
    this.url = `mongodb://localhost:27017/`;
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

  async getDataPremium(id: number) {
    const profile = await this.getProfile(id);
    return await Premium.findOne(
      { _id: profile?.premium?._id },
      { status: 1, _id: 0, end_date: 1 },
    ).lean();
  }

  async getUsersForParse() {
    const users = await User.find({}, { id: 1, profile: 1 }).lean();
    const profiles = await Profile.find(
      { _id: { $in: users.map(({ profile }) => profile) } },
      { premium: 1 },
    ).lean();
    const premiums = await Premium.find(
      { _id: { $in: profiles.map(({ premium }) => premium) } },
      { status: 1 },
    ).lean();

    const promises = users.map(async (user) => {
      const profile = profiles.find(({ _id }) => _id.equals(user.profile));
      const premium = premiums.find(({ _id }) => _id.equals(profile?.premium));
      const dataParser = await this.getDataParser(user.id);
      const extendedUrls: IExtendedDataParserItem[] =
        dataParser?.urls.toObject();
      const urls = extendedUrls?.map(
        ({ _id, ...rest }) => rest as IDataParserItem,
      );
      return {
        id: user.id,
        statusPremium: premium?.status ?? StatusPremium.NONE,
        urls,
      };
    });

    return (await Promise.all(promises))
      .filter(Boolean)
      .reduce<UsersParserData>((acc, { id, urls, statusPremium }) => {
        acc[id] = {
          urls,
          status: statusPremium ?? StatusPremium.NONE,
          canNotify: true,
          referrals: [],
        };
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
    await cache.setCache('users', updatedUsers, 43200);
  }

  async setUrlKufar(userId: number, url: string, urlId: number) {
    const regex =
      /^(https?:\/\/(?:www\.)?(?:re\.|auto\.)?kufar\.by\/l)[\wа-яА-Я\-_.~!*'();/?:@&=+$,%]*$/;

    if (!url.match(regex)) return new Error();

    const dataUrl = await checkUrlOfKufar(url);
    if (!dataUrl || typeof dataUrl !== 'string') return new Error();

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

    await this.addUniqueAds(userId, parserAds(typeUrlParser, dataUrl), urlId);
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
      url: currentUrl?.url,
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
        typeUrlParser: url.typeUrlParser,
        isActive: url.isActive,
        _id: url._id,
      }));

    if (!urls.length) await DataParser.deleteOne({ _id: dataParser._id });
    else
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
      { _id: { $in: parser?.kufar?.kufarAds } },
      { id: 1, _id: 0 },
    );
    const existingIds = existingAds.map((ad) => ad.id);
    const newAds = parseAds.filter((ad) => !existingIds.includes(ad.id));
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
