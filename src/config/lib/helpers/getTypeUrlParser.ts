import { TypesUrlParser } from 'config/types';

export function getTypeUrlParser(url: string): TypesUrlParser {
  const { host } = new URL(url);

  const typeAds = host.split('.')[0] as TypesUrlParser;

  switch (typeAds) {
    case 're':
      return TypesUrlParser.RE;
    case 'auto':
      return TypesUrlParser.AUTO;
    default:
      return TypesUrlParser.OTHERS;
  }
}
