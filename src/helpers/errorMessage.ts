import { bot } from './telegram/bot';

export function errorMsg(
  id: number,
  message: string,
  typeButton: string,
): void {
  const isLink = typeButton === 'link';
  bot.sendMessage(id, message, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `${
              isLink
                ? '📢 Добавить ссылку Kufar'
                : '📍 Добавить трек-номер Европочта'
            }`,
            callback_data: `${isLink ? 'addLink' : 'addTrack'}`,
          },
        ],
      ],
    },
  });
}
