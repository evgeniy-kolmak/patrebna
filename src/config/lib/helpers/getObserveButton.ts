import { Button, type IButton } from 'config/types';
import { t } from 'i18next';

export function getObserveButton(type?: Button, param?: number): IButton[] {
  const defaultButton: IButton[] = [
    {
      text: t('Назад'),
      callback_data: JSON.stringify({ action: 'back_observe' }),
    },
  ];

  if (!type) return defaultButton;

  const buttonMap: Partial<Record<Button, IButton[]>> = {
    [Button.ADD]: [
      {
        text: t('Добавить ссылку'),
        callback_data: JSON.stringify({ action: 'add_link_kufar', param }),
      },
    ],
    [Button.ADD_MORE]: [
      {
        text: t('Добавить еще ссылку'),
        callback_data: JSON.stringify({ action: 'add_link_kufar', param }),
      },
    ],
    [Button.WRAP]: [
      {
        text: `${t('Обертка для ссылки')} - ${param}`,
        callback_data: JSON.stringify({ action: 'wrap_link', param }),
      },
    ],
    [Button.UPDATE]: [
      {
        text: t('Изменить ссылку'),
        callback_data: JSON.stringify({ action: 'add_link_kufar', param }),
      },
    ],
    [Button.START_OBSERVE]: [
      {
        text: t('Начать отслеживание'),
        callback_data: JSON.stringify({
          action: 'change_status_link_kufar',
          param,
        }),
      },
    ],
    [Button.STOP_OBSERVE]: [
      {
        text: t('Остановить отслеживание'),
        callback_data: JSON.stringify({
          action: 'change_status_link_kufar',
          param,
        }),
      },
    ],
    [Button.DELETE]: [
      {
        text: t('Удалить ссылку'),
        callback_data: JSON.stringify({ action: 'remove_link_kufar', param }),
      },
    ],
    [Button.BACK]: [
      {
        text: t('Назад'),
        callback_data: JSON.stringify({ action: 'kufar', param }),
      },
    ],
  };

  return buttonMap[type] ?? defaultButton;
}
