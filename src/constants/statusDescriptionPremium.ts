import { StatusPremium, type StatusDescription } from 'config/types';

export const statusDescription: StatusDescription = {
  [StatusPremium.MAIN]: {
    title: 'Основная',
  },
  [StatusPremium.BASE]: {
    title: 'Базовая',
  },
  [StatusPremium.EXPIRED]: {
    title: 'Истекла',
  },
  [StatusPremium.NONE]: {
    title: 'Неактивна',
  },
};
