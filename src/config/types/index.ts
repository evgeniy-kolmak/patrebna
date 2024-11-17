export interface IUser {
  username?: string;
  first_name?: string;
  last_name?: string;
  premium?: number;
}

export interface IProfile extends IUser {
  link?: string | null;
  count_ads?: number | null;
  count_tracks?: number | null;
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
  description?: string | null;
  price: string;
  createdAt: Date;
}

export interface IPackage {
  trackNumber: string;
  infoPoint: string;
  lengthPath: number;
  comment?: string;
}

export interface IDataPackageApi {
  Timex: string;
  InfoTrack: string;
  IsChooseDeliveryTime: string;
  CheckxFrom: string;
  CheckxTo: string;
  Info: string;
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

export interface Error {
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
