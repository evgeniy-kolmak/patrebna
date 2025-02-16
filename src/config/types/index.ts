export interface IProfile {
  username?: string;
  first_name?: string;
  last_name?: string;
  premium: IPremium;
  referrals: string[];
}

export interface IDataParserItem {
  urlId: number;
  url: string;
  typeUrlParser: TypesUrlParser;
  isActive: boolean;
}

export interface IExtendedDataParserItem {
  _id: string;
}

export type UsersParserData = Record<
  number,
  {
    urls: IDataParserItem[];
    status: StatusPremium;
    referrals: number[];
    canNotify: boolean;
  }
>;

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

export interface Transaction {
  status: StatusTransaction;
  tracking_id: string;
}

export interface TrackingData {
  userId: number;
  messageId: number;
  quantity: number;
}

export enum StatusTransaction {
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  PENDING = 'pending',
}
