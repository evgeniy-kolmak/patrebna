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

export enum TypesUrlParser {
  OTHERS = 'others',
  AUTO = 'auto',
  RE = 're',
}

export enum OperationType {
  INSERT = 'insert',
  UPDATE = 'update',
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

export enum StatusPremium {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  NONE = 'none',
}

export interface IPremium {
  status: StatusPremium;
  end_date?: Date;
}
