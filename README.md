<p align="center">
      <img src="https://i.ibb.co/G0FKZK1/free-icon-chat-bot-9732765.png" width="150">
</p>
<h1 align="center">PATREBNA</h1>

<p align="center">
   <img src="https://img.shields.io/badge/Typescript-%5E5.5.4-%23007acc" alt="Typescript Version">
   <img src="https://img.shields.io/badge/Node%20telegram%20bot%20api-%5E0.66.0-%230088cc" alt="Node telegram botapi Version">
  <img src="https://img.shields.io/badge/DB-Mongodb-%233fa037" alt="Database">
  <img src="https://img.shields.io/badge/Cache-Redis-%23a41e11" alt="Cache">
   <img src="https://img.shields.io/badge/Languages-2-%23ebab00" alt="Languages">
   <img src="https://img.shields.io/badge/Payment-bePaid-%23ff8e09" alt="Payment">
   <img src="https://img.shields.io/badge/Version-v4.0.2-%2300ad64" alt="App Version">
   <img src="https://img.shields.io/badge/License-MIT-%23a31f34" alt="License">
</p>

## Что умеет этот бот?

**Patrebna bot** - бот парсер, который  отслеживает и оповещает о появлении новых объявлений на площадке **Kufar**.
Сообщения приходят в личную переписку с ботом.

## Интерактив с ботом

Что бы начать, достаточно запустить бота `/start`  и добавить ссылку для отслеживания (с выбранной категорией и настроенными фильтрами товаров)  - https://kufar.by/l/город/товар/.

<img src="https://i.ibb.co/CB0xznz/IMG-2389.webp" alt="Пример использования">

#### Какую информацию парсит бот

- Главное фото 
- Заголовок
- Описание (если есть)
- Цена
- Ссылка на объявление

* Параметры могут варьироваться в зависимости от категории объявлений (Недвижимость, Авто или Другое).

<img src="https://i.ibb.co/T00jMgr/IMG-9240.webp" width="400" alt="Пример сообщения">

## Дополнительная информация

- Бот - мультиязычный и поддерживает два языка (русский и белорусский).
- К боту можно подключить оплату подписки через bePaid.
- По умолчанию проверка наличия новых объявлений выполняется раз в 24 минут, в подписке раз в 6 минут.
- В базовой версии можно добавить только одну ссылку для отслеживания, в премиум версии - 3 ссылки.
- Директория **.github** нужна только для разработки и деплоя на сервер (ее можно удалить).

## Разработчик
- [Евгений Колмак](https://github.com/evgeniy-kolmak)

## Лицензия

Проект **Patrebna** распространяется по лицензии MIT.
