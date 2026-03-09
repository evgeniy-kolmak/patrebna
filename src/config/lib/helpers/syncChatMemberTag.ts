import { TelegramService } from 'config/telegram/telegramServise';

export async function syncChatMemberTag(
  chatId: string,
  userId: number,
  tag?: string,
): Promise<void> {
  const userFromChat = await TelegramService.getChatMember(chatId, userId);
  if (userFromChat?.status === 'member') {
    if (userFromChat.tag === tag) return;
    await TelegramService.setChatMemberTag(chatId, userId, tag ?? '');
  }
}
