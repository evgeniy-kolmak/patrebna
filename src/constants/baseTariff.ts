import { StatusPremium, type IOrder } from 'config/types';

export const baseTariff: IOrder = {
  orderId: 0,
  name: 'Базовая подписка',
  quantityOfDays: 30,
  messageForBot: 'Cообщение для базовой подписки',
  amount: 500,
  description: 'Доступ к базовой подписке на 30 дней',
  status: StatusPremium.BASE,
};
