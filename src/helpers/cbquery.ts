import { bot } from './telegram/bot';
import axios from 'axios';
import db from './database';
import { IUser } from './tasks/parseKufar';
import { typeUrlParser } from './parser/typeUrlParser';
import { addTracks } from './tracker/addTracks';
import { errorMsg } from './errorMessage';
import addComment from './tracker/addComment';
import { truncateString } from './utils';

let currentTrackNumber = '';

export default () =>
  bot.on('callback_query', async (query) => {
    const { data, from } = query;
    const id = from.id;
    switch (data) {
      case 'addLink': {
        const promptLink = await bot.sendMessage(
          id,
          '⚙️ Укажите ссылку с параметрами для отслеживания типа - https://kufar.by/l/город/товар/',
          {
            reply_markup: {
              force_reply: true,
              input_field_placeholder: 'https://kufar.by/l/город/товар/',
            },
          },
        );
        const { message_id } = promptLink;
        bot.onReplyToMessage(id, message_id, async (message) => {
          const { entities, text, from } = message;
          if (entities?.[0].type === 'url') {
            try {
              if (text) {
                await axios.get(text);
                await typeUrlParser(text, from as IUser);
                await db.setUrlUser(text, from as IUser);
                bot.sendMessage(
                  id,
                  '🎯 Все прошло успешно, ожидайте обновлений!',
                );
              }
            } catch (error) {
              errorMsg(
                id,
                '🙅‍♂️ Эта ссылка не подходит, попробуйте снова.',
                'link',
              );
            }
          } else {
            errorMsg(
              id,
              '🙅‍♂️ Эта ссылка не подходит, попробуйте снова.',
              'link',
            );
          }
        });
        break;
      }
      case 'changeLink': {
        const promptLink = await bot.sendMessage(
          from.id,
          '⚙️ Укажите ссылку с параметрами для отслеживания - https://kufar.by/l/город/товар/',
          {
            reply_markup: {
              force_reply: true,
              input_field_placeholder: 'https://kufar.by/l/город/товар/',
            },
          },
        );
        const { message_id } = promptLink;
        bot.onReplyToMessage(id, message_id, async (message) => {
          const { entities, text, from } = message;
          if (entities?.[0].type === 'url') {
            try {
              if (text) {
                await db.removeDataParse(id.toString());
                await axios.get(text);
                await typeUrlParser(text, from as IUser);
                await db.setUrlUser(text, from as IUser);
                bot.sendMessage(
                  id,
                  '🎯 Все прошло успешно, ожидайте обновлений!',
                );
              }
            } catch (error) {
              errorMsg(
                id,
                '🙅‍♂️ Эта ссылка не подходит, попробуйте снова.',
                'link',
              );
            }
          } else {
            errorMsg(
              id,
              '🙅‍♂️ Эта ссылка не подходит, попробуйте снова.',
              'link',
            );
          }
        });
        break;
      }
      case 'addTrack': {
        const promptTrack = await bot.sendMessage(
          id,
          '⚙️ Укажите трек-номер для отслеживания типа - <b>BY080012345678</b>',
          {
            reply_markup: {
              force_reply: true,
              input_field_placeholder: 'BY080012345678',
            },
            parse_mode: 'HTML',
          },
        );

        const { message_id } = promptTrack;
        bot.onReplyToMessage(id, message_id, async (message) => {
          const msg = message.text ?? '';
          const dataTrack = await addTracks(msg);
          if ('error' in dataTrack) {
            errorMsg(
              id,
              `🙅‍♂️ Упс! что-то пошло не так. ${dataTrack.errorMessage}, попробуйте снова.`,
              'track',
            );
          } else {
            await db.setTrack(dataTrack, id.toString());
            bot.sendMessage(
              id,
              '🍀 Успешно! Для того чтобы не забыть, о чем идет речь, прикрепите небольшой комментарий к вашему трек-номеру. (Буквально несколько слов).',
            );
            currentTrackNumber = dataTrack.trackNumber;
            await addComment(id.toString());
          }
        });
        break;
      }
      case 'addComment': {
        const promptComment = await bot.sendMessage(
          id,
          '⚙️ Укажите ваш комментарий, желательно не более трех слов.',
          {
            reply_markup: {
              force_reply: true,
              input_field_placeholder: 'Cмартфон',
            },
          },
        );

        const { message_id } = promptComment;
        bot.onReplyToMessage(id, message_id, async (message) => {
          const msg = truncateString(message.text ?? '', 25);
          await db.addСomment(id.toString(), currentTrackNumber, msg);
          await bot.sendMessage(
            id,
            '🎯 Все прошло успешно, ожидайте обновлений!',
          );
        });
        break;
      }
      case 'removeUser': {
        await db.removeUser(id.toString());
        await bot.sendMessage(
          id,
          '👌 Удаление прошло успешно! Будем ждать вас снова.',
        );
        break;
      }
      case 'stopParseAds': {
        await db.removeDataParse(id.toString());
        await bot.sendMessage(
          id,
          '👌 Удаление прошло успешно! Повторно добавить ссылку, моджно используя команды: <a>/start</a> или <a>/change_url</a>.',
          { parse_mode: 'HTML' },
        );
        break;
      }
      case 'back': {
        bot.sendMessage(
          id,
          '📑 Выберите команду для дальнейшего взаимодействия с ботом. Для  этого нажмите на кнопку <b>Меню</b>.\nЕсли регистрация прошла успешно, просто ожидайте обновлений.',
          { parse_mode: 'HTML' },
        );
        break;
      }
    }
  });
