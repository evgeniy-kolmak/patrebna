import { FirebaseApp, initializeApp } from 'firebase/app';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { Database, getDatabase, get, child, ref, set } from 'firebase/database';
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

  getSavedAds(): Promise<ICollection<IAd>> {
    return new Promise((resolve) => {
      get(child(ref(this.db), 'ads'))
        .then((snapshot) => {
          if (snapshot.exists()) {
            resolve(snapshot.val() || {});
          } else {
            console.log('Not data available!');
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  setNewAd(ad: IAd): Promise<any> {
    return new Promise((resolve, reject) => {
      set(ref(this.db, 'ads' + '/' + ad.id), ad)
        .then(() => resolve(''))
        .catch((error) => reject(error));
    });
  }
}

const db = new DatabaseServise();
export default db;

export interface ICollection<T> {
  [key: string]: T;
}

export interface IAd {
  title: string;
  id: string;
  price: string;
  url: string;
}
