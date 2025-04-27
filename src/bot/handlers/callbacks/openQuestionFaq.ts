import { editMessage } from 'config/lib/helpers/editMessage';
import { type ICallbackData } from 'config/types';
import { dataFaq } from 'constants/faq';
import { t } from 'i18next';

export async function handleOpenQuestionFaq(
  chatId: number,
  messageId: number | undefined,
  callbackData: ICallbackData,
  callbackQueryId: string,
): Promise<void> {
  const questionId: number = callbackData.param;
  const text = t(dataFaq[questionId].answer);
  await editMessage(chatId, messageId, text, callbackQueryId, {
    inline_keyboard: [
      [
        {
          text: t('Назад'),
          callback_data: JSON.stringify({
            action: 'back_faq',
          }),
        },
      ],
    ],
  });
}
