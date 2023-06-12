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
      console.log('Successfully');
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
        await set(ref(this.db, `users/${id}/ads`), {});
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

  async removeAds(id: string) {
    try {
      await remove(ref(this.db, `users/${id}/ads`));
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
}

const db = new DatabaseServise();
export default db;

export interface IUser {
  id: number;
  is_bot: boolean;
  username: string;
  first_name: string;
  ads: ICollection<IAd>;
}

export interface ICollection<T> {
  [key: string]: T;
}

export interface IAd {
  img_url: string;
  title: string;
  description?: string;
  id: string;
  price: string;
  url: string;
  createAd: string;
}
