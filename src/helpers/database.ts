import { FirebaseApp, initializeApp } from 'firebase/app';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import {
  Database,
  getDatabase,
  get,
  child,
  ref,
  set,
  remove,
} from 'firebase/database';
import { conf } from '../config';
import { IAd, IUser } from './tasks/parseKufar';
import { ITrack } from './tasks/trackEvropochta';

class DatabaseServise {
  app: FirebaseApp;
  db: Database;
  constructor() {
    try {
      this.app = initializeApp({
        ...conf.firebase,
      });
      const auth = getAuth();
      const email = conf.authFirebase.email ?? '';
      const password = conf.authFirebase.password ?? '';
      signInWithEmailAndPassword(auth, email, password).catch((error) => {
        const { code, message } = error;
        console.log(`${code} - ${message}`);
      });
      this.db = getDatabase(this.app);
      console.log('Database connection: Successfully');
    } catch (e) {
      console.log('Application works without database!');
    }
  }

  async getUsers() {
    try {
      const snapshot = await get(child(ref(this.db), 'users'));
      return snapshot.val();
    } catch (error) {
      console.error(error);
      throw Error("Can't get users");
    }
  }

  async getUserUrl(id: string) {
    try {
      const snapshot = await get(
        child(ref(this.db), `users/${id}/parserData/url`),
      );
      return snapshot.val();
    } catch (error) {
      console.error(error);
      throw Error("Can't get user url");
    }
  }

  async getUserTypeParser(id: string) {
    try {
      const snapshot = await get(
        child(ref(this.db), `users/${id}/parserData/typeParser`),
      );
      return snapshot.val();
    } catch (error) {
      console.error(error);
      throw Error("Can't get user type parser");
    }
  }

  async getSavedAds(id: string) {
    try {
      const snapshot = await get(child(ref(this.db), `users/${id}/ads`));
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return {};
      }
    } catch (error) {
      console.error(error);
      throw Error("Can't get user save ads");
    }
  }

  async setUserListener(user: IUser) {
    try {
      await set(ref(this.db, `users/${user.id}/profile`), user);
    } catch (error) {
      console.error(error);
      throw Error("Can't set user listener");
    }
  }

  async setUrlUser(url: string, user: IUser) {
    try {
      await set(ref(this.db, `users/${user.id}/parserData/url`), url);
    } catch (error) {
      console.error(error);
      throw Error("Can't set url user");
    }
  }

  async setUserTypeParser(typeParse: string, user: IUser): Promise<void> {
    try {
      await set(
        ref(this.db, `users/${user.id}/parserData/typeParser`),
        typeParse,
      );
    } catch (error) {
      console.error(error);
      throw Error("Can't set user type parser");
    }
  }

  async setNewAd(ad: IAd, id: string) {
    try {
      set(ref(this.db, `users/${id}/ads/${ad.id}`), ad);
    } catch (error) {
      console.error(error);
      throw Error("Can't set new ad");
    }
  }

  async isAdsEmpty(id: string) {
    try {
      const snapshot = await get(child(ref(this.db), `users/${id}/ads`));
      return snapshot.val();
    } catch (error) {
      throw Error("Can't get value ads");
    }
  }

  async removeDataParse(id: string) {
    try {
      await remove(ref(this.db, `users/${id}/ads`));
      await remove(ref(this.db, `users/${id}/parserData`));
    } catch (error) {
      console.error(error);
      throw Error("Can't delete ads");
    }
  }

  async removeUser(id: string): Promise<void> {
    try {
      await remove(child(ref(this.db, 'users'), id.toString()));
    } catch (error) {
      console.error(error);
      throw Error("Can't delete user");
    }
  }

  async getTrack(id: string, trackNumber: string): Promise<ITrack> {
    try {
      const snapshot = await get(
        child(ref(this.db), `users/${id}/packages/${trackNumber}/`),
      );
      return snapshot.val();
    } catch (error) {
      throw Error("Can't get value track");
    }
  }
  async getPackages(id: string) {
    try {
      const snapshot = await get(child(ref(this.db), `users/${id}/packages/`));
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return {};
      }
    } catch (error) {
      console.error(error);
      throw Error("Can't get user save packages");
    }
  }

  async setTrack(dataTrack: ITrack, id: string): Promise<void> {
    try {
      await set(
        ref(this.db, `users/${id}/packages/${dataTrack.trackNumber}`),
        dataTrack,
      );
    } catch (error) {
      console.error(error);
      throw Error("Can't set value track");
    }
  }

  async setCompareDataTrack(
    id: string,
    { trackNumber, lengthPath, infoPoint }: ITrack,
  ) {
    try {
      await set(
        ref(this.db, `users/${id}/packages/${trackNumber}/lengthPath/`),
        lengthPath,
      );
      await set(
        ref(this.db, `users/${id}/packages/${trackNumber}/infoPoint/`),
        infoPoint,
      );
    } catch (error) {
      console.error(error);
      throw Error("Can't set compare data");
    }
  }
  async addСomment(
    id: string,
    trackNumber: string,
    comment: string,
  ): Promise<void> {
    try {
      await set(
        ref(this.db, `users/${id}/packages/${trackNumber}/comment/`),
        comment,
      );
    } catch (error) {
      console.error(error);
      throw Error("Can't add comment");
    }
  }
}

const db = new DatabaseServise();
export default db;
