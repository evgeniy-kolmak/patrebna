<p align="center">
      <img src="https://i.ibb.co/G0FKZK1/free-icon-chat-bot-9732765.png" width="150">
</p>
<h1 align="center">PATREBNA</h1>

<p align="center">
   <img src="https://img.shields.io/badge/Typescript-%5E5.0.4-blue" alt="Typescript Version">
   <img src="https://img.shields.io/badge/Node%20telegram%20bot%20api-%5E0.61.0-blueviolet" alt="Node telegram botapi Version">
  <img src="https://img.shields.io/badge/DB-Firebase-important" alt="Database">
   <img src="https://img.shields.io/badge/Version-v1.0-9cf" alt="App Version">
   <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

## Что умеет этот бот?

**Patrebna bot** - бот парсер, который  отслеживает и оповещает о появлении новых объявлений на площадке Kufar. Сообщения приходят в личную переписку с ботом.

## Интерактив с ботом

Что бы начать, достаточно запустить бота `/start`  и добавить ссылку для отслеживания (с выбранной категорией и настроенными фильтрами товаров)  - https://kufar.by/l/город/товар/.

#### Бот рапознает 4 команды:

  - `/start` - Запустить бота.
  - `/help` - Помощь и информация.
  - `/changeurl` - Изменить ссылку для отслеживания.
  - `/stop` - Остановить бота.

#### Какую информацию парсит бот

- Главное фото 
- Заголовок
- Описание (если есть)
- Цена
- Ссылка на объявление

* Параметры могут варьироваться в зависимости от категории объявлений (Недвижимость, Авто или Другое).

**Пример сообщения** 

<img src="https://i.ibb.co/jZV3H3r/image.png" alt="Пример сообщения">

##### Парсинг коммерчиских объявлений отключен по умолчанию.

Что бы включить -  уберите из кода **src/helpers/parcer/categories/auto.ts** (пример)  `isNotCompanyAd`.

## Документация 

### Telegram

**BotFather**

 - Регистрируем бота телеграм, получаем токен  
 - Создаем команды (описаны выше) - Bot Settings >  `/setcommands`

### Firebase

- Создаем **Realtime Database**
- Получаем конфигурацию для подключения базы данных 
- В корне БД создаем `users` 

### Конфигурация 

В корне проекта создаем директорию `config` и в ней файл `default.yaml`

```
{
  authFirebase:
    { email: 'ваш_имейл', password: 'ваш_пароль' },
  firebase:
    {
      apiKey: 'конфиг_бд',
      authDomain: 'конфиг_бд',
      databaseURL: 'конфиг_бд',
      projectId: 'конфиг_бд',
      storageBucket: 'конфиг_бд',
      messagingSenderId: 'конфиг_бд',
      appId: 'конфиг_бд',
      measurementId: 'конфиг_бд',
    },
  tokenBot: 'токен_вашего_бота',
  webhook: { url: 'ваш_url', port: ваш_порт },
}
```
### Работа с проектом

**Установка зависимостей**
```
npm install
```
**Разработка**
```
npm start 
```
```
npm run dev 
```
**Сборка**
```
npm run build
```
**Выполнение скрипта (cron)**

По умолчанию проверка наличия новых объявлений выполняется раз в 15 минут (*/15).

## Тестовый запуск 

### Ngrok 

```
ngrok http ваш_порт
```
Например: `ngrok http 3000`  Полученный url и указазаный порт нужно добавить в конфигурацию.

### Альтернативный метод 

Замените метод работы бота с `webhook` на `pooling: true` в **src/helpers/telegram/bot.ts**

### Запуск
```
node dist/index.js
```

## Разработчик
- [Evgeniy Kolmak](https://github.com/evgeniy-kolmak)

## Лицензия

Project **Patrebna** is distributed under the MIT license.
