import { bot } from '../bot';

export function commandHelp() {
  bot.onText(/\/help/, async (ctx) => {
    const id = ctx.from?.id;
    if (id) {
      bot.sendMessage(
        id,
        '<b>Patrebna</b> - Чат-бот для отслеживания новых объявлений Kufar поможет вам быть в курсе последних обновлений.\n\nВы можете управлять мной, отправив следующие команды:\n<a>/start</a> - Запустить бота.\n<a>/help</a> - Помощь и информация.\n<a>/change_url</a> - Изменить ссылку для отслеживания.\n<a>/track_packages</a> - Отслеживать поcылки.\n<a>/stop</a> - Остановить бота.\n\nТехподдержка: <a>@evgeniykolmak</a>',
        { parse_mode: 'HTML' },
      );
    }
  });
}
