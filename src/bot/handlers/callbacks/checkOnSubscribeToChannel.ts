import i18next, { t } from 'i18next';
import { bot } from 'bot';
import db from 'config/db/databaseServise';
import { getUserLanguage } from 'config/lib/helpers/cacheLaguage';
import { editMessage } from 'config/lib/helpers/editMessage';

export async function handleChekOnSubscribeToChannel(
  chatId: number,
  messageId: number | undefined,
  callbackQueryId: string,
): Promise<void> {
  await i18next.changeLanguage(await getUserLanguage(chatId));
  const { status } = await bot.getChatMember('@patrebna_news', chatId);
  if (['creator', 'administrator', 'member'].includes(status)) {
    await editMessage(
      chatId,
      messageId,
      t('Сообщение об успешном выполнении задания'),
      callbackQueryId,
    );
    await db.rewardForChannelSubscription(chatId);
  } else {
    await bot.sendMessage(
      chatId,
      t('Сообщение о неудачном выполнении задания'),
      { parse_mode: 'HTML' },
    );
  }
}
