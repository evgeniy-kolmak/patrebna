import db from 'config/db/databaseServise';
import { t } from 'i18next';
import { sendMessage } from 'config/lib/helpers/sendMessage';
import { sendPhoto } from 'config/lib/helpers/sendPhoto';
import { type ICommandHandler, StatusPremium } from 'config/types';
import keyboards from 'bot/keyboards';
import { statusDescription } from 'constants/statusDescriptionPremium';
import { notRegistrationMessage } from 'config/lib/helpers/notRegistrationMessage';
import { bot } from 'bot';

export const сommandHandlers: ICommandHandler[] = [
  {
    regex: /\/start(?: (.+))?/,
    handler: async (userId, match) => {
      const payload = match?.[1] ?? null;
      let referrerId: number | undefined;
      if (payload?.startsWith('ref')) {
        const parsed = Number(payload.slice(3));
        if (!isNaN(parsed)) {
          referrerId = parsed;
        }
      }
      const isRegistered = await db.getUser(userId);
      await sendMessage(userId, t('Приветствие'), keyboards.Main());
      if (isRegistered) {
        await sendMessage(
          userId,
          t('Сообщение об отслеживании'),
          keyboards.Observe(),
        );
      } else await notRegistrationMessage(userId, referrerId);
    },
    options: { public: true },
  },
  {
    regex: /Помощь|Дапамога/,
    handler: async (userId) => {
      await sendMessage(userId, t('Сообщение для FAQ'), keyboards.Faq());
      await sendMessage(userId, t('Техподдержка'));
    },
    options: { public: true },
  },
  {
    regex: /Профиль|Профіль/,
    handler: async (userId: number) => {
      const profile = await db.getProfile(userId);
      const premium = await db.getDataPremium(userId);
      const status = premium?.status ?? StatusPremium.NONE;
      const endDatePremium = premium?.end_date;
      const createdAtProfile = premium?.createdAt;
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        timeZone: 'Europe/Minsk',
      };

      const dataProfile = [
        `${t('Сообщение для профиля')}`,
        '',
        `<b>${t('ФИО')}</b>: ${profile?.last_name ?? ''} ${profile?.first_name ?? ''}`,
        `${profile?.username ? `<b>${t('Псевдоним')}</b>: ${profile?.username ?? ''}` : ''}`,
        `<b>${t('Дата регистрации')}</b>: ${createdAtProfile ? `<i>${new Date(createdAtProfile).toLocaleDateString('ru-RU', options)}</i>` : t('Недавно')}`,
        `<b>${t('Подписка')}</b>: ${t(statusDescription[status].title)} ${status === StatusPremium.ACTIVE && endDatePremium ? `${t('До')} <i>${new Date(endDatePremium).toLocaleDateString('ru-RU', options)}</i>` : ''}`,
        `<b>${t('Подписка на канал')}</b>: ${profile?.subscribeToChannel ? '☑️' : '✖️'}`,
        `<b>${t('Количество рефералов')}</b>: ${profile?.referrals?.length}`,
        `<b>${t('Бонусы')}</b>: ${profile?.wallet ?? 0}`,
      ].join('\n');
      const { photos, total_count } = await bot.getUserProfilePhotos(userId, {
        offset: 0,
        limit: 1,
      });

      if (!total_count || !photos?.length) {
        await sendMessage(userId, dataProfile, keyboards.Profile());
        return;
      }

      const avatar = photos[0];
      const bestQuality = avatar[avatar?.length - 1];
      await sendPhoto(
        userId,
        dataProfile,
        keyboards.Profile(),
        bestQuality.file_id,
      );
    },
  },
  {
    regex: /Отслеживать|Адсочваць/,
    handler: async (userId: number) => {
      await sendMessage(
        userId,
        t('Сообщение об отслеживании'),
        keyboards.Observe(),
      );
    },
  },
  {
    regex: /Подписка|Падпіска/,
    handler: async (userId: number) => {
      await sendMessage(userId, t('Описание подписки'), keyboards.Premium());
    },
  },
  {
    regex: /Язык|Мова/,
    handler: async (userId: number) => {
      await sendMessage(userId, t('Переключить язык приложения'), {
        inline_keyboard: [
          [
            {
              text: t('Сменить язык'),
              callback_data: JSON.stringify({ action: 'change_language' }),
            },
          ],
        ],
      });
    },
  },
];
