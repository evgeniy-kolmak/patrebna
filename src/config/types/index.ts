import { type InlineKeyboardMarkup } from 'node-telegram-bot-api';

interface IBaseMessage {
  userId: number;
}

export interface IBotAdsMessage extends IBaseMessage {
  newAds: IAd[] | IExtendedAd[];
  key: string;
}

export interface IBotNotificationMessage extends IBaseMessage {
  text: string;
  keyboard?: InlineKeyboardMarkup;
}

export interface IProfile {
  username?: string;
  first_name?: string;
  last_name?: string;
  subscribeToChannel: boolean;
  premium: IPremium;
}

export interface IDataParserItem {
  urlId: number;
  url: string;
  isActive: boolean;
}

export interface IExtendedDataParserItem {
  _id: string;
}

export interface IParserData {
  urls: IDataParserItem[];
  status: StatusPremium;
  canNotify: boolean;
}
export interface ICommandHandler {
  regex: RegExp;
  handler: (userId: number, match: RegExpExecArray | null) => Promise<void>;
  options?: { public?: boolean };
}

export type LanguageOfUser = Record<number, { language: Languages }>;

export type StatusDescription = Record<StatusPremium, { title: string }>;

export interface IAd {
  id: string;
  title: string;
  url: string;
  img_url: string;
  region: string;
  price: string;
}

export enum Languages {
  Russian = 'ru',
  Belarusian = 'by',
}
export interface IPremiumActions {
  buyMain: string;
  buyBase: string;
  back: string;
}
export type TariffActions = 'choose_tariff' | 'payment_with_bonuses';
export type BackAction = 'back_store' | 'buy_premium';

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

export interface ICallbackData {
  action: string;
  param?: any;
}

export enum StatusPremium {
  MAIN = 'main',
  BASE = 'base',
  EXPIRED = 'expired',
  NONE = 'none',
}

export interface IPremium {
  status: StatusPremium;
  end_date?: Date;
  downgrade_date?: Date;
}

export interface IOrder {
  orderId: number;
  name: string;
  quantityOfDays: number;
  description: string;
  amount: number;
  messageForBot: string;
  status: StatusPremium;
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
  quantity?: number;
  amount: number;
  status: StatusPremium;
}

export enum StatusTransaction {
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  PENDING = 'pending',
}

export function isTelegramError(error: unknown): error is {
  response: {
    body: {
      error_code: number;
      description: string;
      parameters?: { retry_after?: number };
    };
  };
} {
  const body = (error as any)?.response?.body;
  return (
    typeof body?.error_code === 'number' &&
    typeof body?.description === 'string'
  );
}

export interface IExtendedAd extends IAd {
  saller_id: string;
  saller_name: string;
  coordinates?: number[];
  parameters: ParameterMap;
}

export type ParamValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>
  | [number, number];

export interface RawParam {
  vl: ParamValue;
  p: string;
  v: ParamValue;
}
export interface RawImage {
  path: string;
  media_storage: string;
}
export interface RawAd {
  account_id: string;
  account_parameters: RawParam[];
  ad_id: number;
  subject: string;
  ad_link: string;
  body_short: string | null;
  price_byn: string;
  price_usd: string;
  images: RawImage[];
  ad_parameters: RawParam[];
}
export enum AdParameters {
  Area = 'area',
  CarsCapacity = 'cars_capacity',
  CarsEngine = 'cars_engine',
  CarsGearbox = 'cars_gearbox',
  CarsType = 'cars_type',
  Сondition = 'condition',
  Coordinates = 'coordinates',
  Delivery = 'delivery_enabled',
  Floor = 'floor',
  Mileage = 'mileage',
  NAME = 'name',
  ReNumberFloors = 're_number_floors',
  RegDate = 'regdate',
  Rooms = 'rooms',
  Safedeal = 'safedeal_enabled',
  Size = 'size',
  SquareMeter = 'square_meter',
  YearBuilt = 'year_built',
}

export interface INotification {
  url: string;
  image: string;
  caption: string;
}

export interface IPremiumTransitionConfig {
  findStatus: StatusPremium[];
  dateField: 'end_date' | 'downgrade_date';
  newStatus: StatusPremium;
  unsetField?: 'downgrade_date';
}

export type ParameterMap = Partial<Record<AdParameters, any>>;
