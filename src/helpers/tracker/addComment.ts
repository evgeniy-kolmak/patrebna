import { bot } from '../telegram/bot';
export default async function addComment(id: string): Promise<void> {
  await bot.sendMessage(
    id,
    '👕 Например: Кофта, смартфон, спортивный костюм.',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: ' ✏️ Добавить комментарий',
              callback_data: 'addComment',
            },
            {
              text: ' ◀ Назад',
              callback_data: 'back',
            },
          ],
        ],
      },
    },
  );
}
