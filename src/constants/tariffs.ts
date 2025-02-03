import { type IOrder } from 'config/types';

export const tariffData: IOrder[] = [
  {
    orderId: 1,
    name: 'Пробный',
    qauntityOfDays: 1,
    messageForBot: 'Cообщение для пробного',
    description: 'Доступ к премиум-подписке на 1 день',
    amount: 200,
  },
  {
    orderId: 2,
    name: 'Минимальный',
    qauntityOfDays: 3,
    messageForBot: 'Cообщение для минимального',
    description: 'Доступ к премиум-подписке на 3 дня.',
    amount: 500,
  },
  {
    orderId: 3,
    name: 'Оптимальный',
    qauntityOfDays: 7,
    messageForBot: 'Cообщение для оптимального',
    description: 'Доступ к премиум-подписке на 7 дней.',
    amount: 900,
  },
  {
    orderId: 4,
    name: 'Расширенный',
    qauntityOfDays: 15,
    messageForBot: 'Cообщение для расширенного',
    description: 'Доступ к премиум-подписке на 15 дней.',
    amount: 1200,
  },
  {
    orderId: 5,
    name: 'Максимальный',
    qauntityOfDays: 30,
    messageForBot: 'Cообщение для максимального',
    description: 'Доступ к премиум-подписке на 30 дней.',
    amount: 1500,
  },
];

// нужно прогнать через интернализацию
