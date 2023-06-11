import { bot } from '../bot';

export function commandHelp() {
  bot.onText(/\/help/, async (ctx) => {
    const id = ctx.from?.id;
    if (id) {
      bot.sendMessage(
        id,
        `<b>Patrebna</b> - Чат-бот для отслеживания новых объявлений Kufar поможет вам быть в курсе последних обновлений.\n
         Вы можете управлять мной, отправив следующие команды:\n
         <a>/start</a> - Запустить бота.
         <a>/help</a> - Помощь и информация.
         <a>/changeurl</a> - Изменить ссылку для отслеживания.
         <a>/stop</a> - Остановить бота.`,
        { parse_mode: 'HTML' },
      );
    }
  });
}
