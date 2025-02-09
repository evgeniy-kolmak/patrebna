import { StatusPremium, type StatusDescription } from 'config/types';

export const statusDescription: StatusDescription = {
  [StatusPremium.ACTIVE]: {
    title: 'Активна',
  },
  [StatusPremium.EXPIRED]: {
    title: 'Истекла',
  },
  [StatusPremium.NONE]: {
    title: 'Неактивна',
  },
};
