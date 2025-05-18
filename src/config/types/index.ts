export interface IProfile {
  username?: string;
  first_name?: string;
  last_name?: string;
  subscribeToChannel: boolean;
  premium: IPremium;
  referrals: string[];
}

export interface IDataParserItem {
  urlId: number;
  url: string;
  typeUrlParser: TypesUrlParser;
  isActive: boolean;
  ids: number[];
}

export interface IExtendedDataParserItem {
  _id: string;
}

export interface IParserData {
  urls: IDataParserItem[];
  status: StatusPremium;
  canNotify: boolean;
}

export type LanguageOfUser = Record<number, { language: Languages }>;

export type StatusDescription = Record<StatusPremium, { title: string }>;

export interface IAd {
  id: string;
  title: string;
  url: string;
  img_url: string;
  description?: string | null;
  price: string;
  createdAt: Date;
}

export enum Languages {
  Russian = 'ru',
  Belarusian = 'by',
}

export interface IButton {
  text: string;
  callback_data: string;
}

export enum Button {
  ADD = 'add',
  ADD_MORE = 'add_more',
  WRAP = 'wrap',
  UPDATE = 'update',
  START_OBSERVE = 'start_observe',
  STOP_OBSERVE = 'stop_observe',
  DELETE = 'delete',
  BACK = 'back',
}

export enum TypesUrlParser {
  OTHERS = 'others',
  AUTO = 'auto',
  RE = 're',
}

export enum OperationType {
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum UserActions {
  REMOVE = 'remove',
  NOTIFACTION = 'notification',
}

export interface IFaq {
  question: string;
  answer: string;
}

export interface IErrorTelegram {
  response: {
    body: {
      error_code: number;
      description: string;
    };
    request: {
      href: string;
    };
  };
}

export interface ICallbackData {
  action: string;
  param?: any;
}

export enum StatusPremium {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  NONE = 'none',
}

export interface IPremium {
  status: StatusPremium;
  end_date?: Date;
}

export interface IOrder {
  orderId: number;
  name: string;
  quantityOfDays: number;
  description: string;
  amount: number;
  messageForBot: string;
}

export interface ResponseTransaction {
  status: StatusTransaction;
  tracking_id: string;
}
export interface ResponseOrder {
  tracking_id: string;
  description: string;
  amount: number;
}

export interface ITrackingData {
  userId: number;
  messageId: number;
  quantity: number;
}

export enum StatusTransaction {
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  PENDING = 'pending',
}
