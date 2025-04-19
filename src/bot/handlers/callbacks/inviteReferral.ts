import { editMessage } from 'config/lib/helpers/editMessage';
import { t } from 'i18next';

export async function handleInviteReferral(
  chatId: number,
  messageId: number | undefined,
  callbackQueryId: string,
): Promise<void> {
  const invitationLink = `https://t.me/patrebnaBot?start=ref${chatId}`;
  await editMessage(
    chatId,
    messageId,
    `${t('Текс с задачей  о приглашении друга')}\n\n<code>${invitationLink}</code>`,
    callbackQueryId,
    {
      inline_keyboard: [
        [
          {
            text: t('Назад'),
            callback_data: JSON.stringify({ action: 'get_free_premium' }),
          },
        ],
      ],
    },
  );
}
