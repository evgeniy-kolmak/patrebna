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

  getUsers(): Promise<ICollection<IUser>> {
    return new Promise((resolve) => {
      get(child(ref(this.db), 'users'))
        .then((snapshot) => resolve(snapshot.val()))
        .catch((error) => console.log(error));
    });
  }

  setUserListener(user: IUser): Promise<any> {
    return new Promise((resolve) => {
      set(ref(this.db, `users/${user.id}/profile`), user)
        .then(() => resolve(''))
        .catch((error) => console.log(error));
    });
  }

  setUrlUser(url: string, user: IUser): Promise<any> {
    return new Promise((resolve) => {
      set(ref(this.db, `users/${user.id}/parserData/url`), url)
        .then(() => resolve(''))
        .catch((error) => console.log(error));
    });
  }

  getUserUrl(id: string): Promise<string> {
    return new Promise((resolve) => {
      get(child(ref(this.db), `users/${id}/parserData/url`))
        .then((snapshot) => resolve(snapshot.val()))
        .catch((error) => console.log(error));
    });
  }

  async setUserTypeParser(typeParse: string, user: IUser): Promise<any> {
    try {
      await set(
        ref(this.db, `users/${user.id}/parserData/typeParser`),
        typeParse,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getUserTypeParser(id: string): Promise<any> {
    try {
      const snapshot = await get(
        child(ref(this.db), `users/${id}/parserData/typeParser`),
      );
      return snapshot.val();
    } catch (error) {
      console.log(error);
    }
  }

  getSavedAds(id: string): Promise<ICollection<IAd>> {
    return new Promise((resolve) => {
      get(child(ref(this.db), `users/${id}/ads`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            resolve(snapshot.val() || {});
          } else {
            set(ref(this.db, `users/${id}/ads`), {})
              .then(() => resolve({}))
              .catch((error) => console.log(error));
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  setNewAd(ad: IAd, id: string): Promise<any> {
    return new Promise((resolve) => {
      set(ref(this.db, `users/${id}/ads/${ad.id}`), ad)
        .then(() => resolve(''))
        .catch((error) => console.log(error));
    });
  }

  isAdsEmpty(id: string): Promise<ICollection<IAd>> {
    return new Promise((resolve) => {
      get(child(ref(this.db), `users/${id}/ads`))
        .then((snapshot) => resolve(snapshot.val()))
        .catch((error) => console.log(error));
    });
  }

  async removeAds(id: string): Promise<void> {
    await remove(ref(this.db, `users/${id}/ads`));
  }

  // removeOldAd(id: string): Promise<any>  {
  //   return new Promise((resolve) => {
  //     resolve(remove(child(ref(this.db, 'ads'), id)));
  //   });
  // }
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
  id: string;
  price: string;
  url: string;
  createAd: string;
}
