import { bot } from './telegram/bot';

export function errorMsg(id: number, command: string): void {
  bot.sendMessage(
    id,
    `🙅‍♂️ Эта ссылка не подходит, попробуйте снова - <a>${command}</a>`,
    { parse_mode: 'HTML' },
  );
}
