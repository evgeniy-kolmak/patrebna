import config from 'config';

export const conf: Iconf = {
  authFirebase: {
    email: config.get('authFirebase.email'),
    password: config.get('authFirebase.password'),
  },
  firebase: {
    apiKey: config.get('firebase.apiKey'),
    authDomain: config.get('firebase.authDomain'),
    databaseURL: config.get('firebase.databaseURL'),
    projectId: config.get('firebase.projectId'),
    storageBucket: config.get('firebase.storageBucket'),
    messagingSenderId: config.get('firebase.messagingSenderId'),
    appId: config.get('firebase.appId'),
    measurementId: config.get('firebase.measurementId'),
  },
  tokenBot: config.get('tokenBot'),
  webhook: {
    url: config.get('webhook.url'),
    port: config.get('webhook.port'),
  },
};

export interface Iconf {
  authFirebase: {
    email: string;
    password: string;
  };
  firebase: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: number;
    appId: string;
    measurementId: string;
  };
  tokenBot: string;
  webhook: {
    url: string;
    port: number;
  };
}
