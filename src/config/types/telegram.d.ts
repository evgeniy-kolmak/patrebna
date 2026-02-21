import 'node-telegram-bot-api';

declare module 'node-telegram-bot-api' {
  interface InlineKeyboardButton {
    style?: 'primary' | 'danger' | 'success' | undefined;
    icon_custom_emoji_id?: string | undefined;
  }
  interface KeyboardButton {
    style?: 'primary' | 'danger' | 'success' | undefined;
    icon_custom_emoji_id?: string | undefined;
  }
}
