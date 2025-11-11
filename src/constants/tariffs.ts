import { type IOrder } from 'config/types';

export const tariffData: IOrder[] = [
  {
    orderId: 1,
    name: 'Пробный',
    quantityOfDays: 1,
    messageForBot: 'Cообщение для пробного',
    description: 'Доступ к премиум-подписке на 1 день',
    amount: 150,
  },
  {
    orderId: 2,
    name: 'Минимальный',
    quantityOfDays: 3,
    messageForBot: 'Cообщение для минимального',
    description: 'Доступ к премиум-подписке на 3 дня.',
    amount: 400,
  },
  {
    orderId: 3,
    name: 'Оптимальный',
    quantityOfDays: 7,
    messageForBot: 'Cообщение для оптимального',
    description: 'Доступ к премиум-подписке на 7 дней.',
    amount: 750,
  },
  {
    orderId: 4,
    name: 'Расширенный',
    quantityOfDays: 15,
    messageForBot: 'Cообщение для расширенного',
    description: 'Доступ к премиум-подписке на 15 дней.',
    amount: 900,
  },
  {
    orderId: 5,
    name: 'Максимальный',
    quantityOfDays: 30,
    messageForBot: 'Cообщение для максимального',
    description: 'Доступ к премиум-подписке на 30 дней.',
    amount: 1250,
  },
];
