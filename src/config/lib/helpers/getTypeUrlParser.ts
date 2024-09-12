import { TypesParser } from 'config/types';

export function getTypeUrlParser(url: string): TypesParser {
  const { host } = new URL(url);

  const typeAds = host.split('.')[0] as TypesParser;

  switch (typeAds) {
    case 're':
      return TypesParser.RE;
    case 'auto':
      return TypesParser.AUTO;
    default:
      return TypesParser.OTHERS;
  }
}
