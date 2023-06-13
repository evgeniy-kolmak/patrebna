import config from 'config';
import { FirebaseOptions } from 'firebase/app';

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

type AuthFirebase = {
  email: string;
  password: string;
};

type WebhookParams = {
  url: string;
  port: number;
};

export interface Iconf {
  authFirebase: AuthFirebase;
  firebase: FirebaseOptions;
  tokenBot: string;
  webhook: WebhookParams;
}
