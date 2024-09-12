export interface Iconf {
  tokenBot: string;
}

export interface IUser {
  username?: string;
  first_name?: string;
  last_name?: string;
  premium?: number;
}

export interface IProfile extends IUser {
  link?: string;
  count_ads?: number;
}

export interface ParserData {
  url: string;
  typeParser: TypesParser;
}
export interface IAd {
  id: string;
  title: string;
  url: string;
  img_url: string;
  description?: string;
  price: string;
}

export enum Languages {
  Russian = 'ru',
  Belarusian = 'by',
}

export enum TypesParser {
  OTHERS = 'others',
  AUTO = 'auto',
  RE = 're',
}

export interface IConfig {
  telegram: {
    token: string;
  };
}
