import config from 'config';
import { type Iconf } from 'config/types';

export const conf: Iconf = {
  tokenBot: config.get('tokenBot'),
};
