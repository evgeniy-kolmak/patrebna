import { StatusPremium, type IOrder } from 'config/types';

export const ratesData: Array<Omit<IOrder, 'quantityOfDays'>> = [
  {
    orderId: 1,
    name: '1️⃣0️⃣',
    description: 'Пополнение кошелька на 10 бонусов.',
    amount: 100,
    messageForBot: 'Бонус 10',
    status: StatusPremium.MAIN,
  },
  {
    orderId: 2,
    name: '5️⃣0️⃣',
    description: 'Пополнение кошелька на 50 бонусов.',
    amount: 500,
    messageForBot: 'Бонус 50',
    status: StatusPremium.MAIN,
  },
  {
    orderId: 3,
    name: '1️⃣0️⃣0️⃣',
    description: 'Пополнение кошелька на 100 бонусов.',
    amount: 1000,
    messageForBot: 'Бонус 100',
    status: StatusPremium.MAIN,
  },
  {
    orderId: 4,
    name: '2️⃣5️⃣0️⃣',
    description: 'Пополнение кошелька на 250 бонусов.',
    amount: 2500,
    messageForBot: 'Бонус 250',
    status: StatusPremium.MAIN,
  },
  {
    orderId: 5,
    name: '5️⃣0️⃣0️⃣',
    description: 'Пополнение кошелька на 500 бонусов.',
    amount: 5000,
    messageForBot: 'Бонус 500',
    status: StatusPremium.MAIN,
  },
  {
    orderId: 6,
    name: '1️⃣0️⃣0️⃣0️⃣',
    description: 'Пополнение кошелька на 1000 бонусов.',
    amount: 10000,
    messageForBot: 'Бонус 1000',
    status: StatusPremium.MAIN,
  },
];
