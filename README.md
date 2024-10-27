<p align="center">
      <img src="https://i.ibb.co/G0FKZK1/free-icon-chat-bot-9732765.png" width="150">
</p>
<h1 align="center">PATREBNA</h1>

<p align="center">
   <img src="https://img.shields.io/badge/Typescript-%5E5.5.4-blue" alt="Typescript Version">
   <img src="https://img.shields.io/badge/Node%20telegram%20bot%20api-%5E0.66.0-blueviolet" alt="Node telegram botapi Version">
  <img src="https://img.shields.io/badge/DB-Mongodb-green" alt="Database">
   <img src="https://img.shields.io/badge/Languages-2-red" alt="Languages">
   <img src="https://img.shields.io/badge/Version-v3.3.2-9cf" alt="App Version">
   <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

## Что умеет этот бот?

**Patrebna bot** - бот парсер, который  отслеживает и оповещает о появлении новых объявлений на площадке **Kufar**.
Сообщения приходят в личную переписку с ботом.

## Интерактив с ботом

Что бы начать, достаточно запустить бота `/start`  и добавить ссылку для отслеживания (с выбранной категорией и настроенными фильтрами товаров)  - https://kufar.by/l/город/товар/.

<img src="https://i.ibb.co/CB0xznz/IMG-2389.webp" width="1000" alt="Пример использования">


#### Какую информацию парсит бот

- Главное фото 
- Заголовок
- Описание (если есть)
- Цена
- Ссылка на объявление

* Параметры могут варьироваться в зависимости от категории объявлений (Недвижимость, Авто или Другое).

<img src="https://i.ibb.co/T00jMgr/IMG-9240.webp" width="400" alt="Пример сообщения">

##### Парсинг коммерчиских объявлений отключен по умолчанию.

Что бы включить -  уберите из кода **src/parsers/kufar/categories/other.ts** (пример)  `isNotCompanyAd`.

## Документация 

#### Создание окружение

- В корне проекта нужно создать файл окружения - `touch .env`.

```
MONGO_INITDB_ROOT_USERNAME= ИМЯ_ПОЛЬЗОВАТЕЛЯ_БД
MONGO_INITDB_ROOT_PASSWORD= ПАРОЛЬ_ПОЛЬЗОВАТЕЛЯ_БД
TELEGRAM_BOT_TOKEN= ТОКЕН_БОТА_ТЕЛЕГРАМ
WEBHOOK_HOST= АДРЕС_СЕРВЕРА (IP)
WEBHOOK_PORT= ПОРТ (обычно 8443 или 443 для ssl)
```
#### Создание SSL сертификатов 

- В корне проекта нужно создать директорию для хранение сертификатов - `mkdir certs`.
- Переходим в директория `cd certs` и в ней создаем две поддиректории `mkdir mongodb && mkdir bot`
- Создаем два файла конфигруции `touch openssl.cnf && touch config.cnf`

**Openssl.cnf**

```
[ req ]
distinguished_name = x509_distinguished_name
x509_extensions = x509_ext
prompt = no
default_md = sha256

[ x509_distinguished_name ]
CN = Общее название 
O = Название компании
L = Город
C = Регион

[ x509_ext ]
basicConstraints = critical,CA:true
keyUsage = critical, keyCertSign, cRLSign
```

**Config.cnf**

```
[ req ]
distinguished_name = x509_distinguished_name
x509_extensions = x509_ext
prompt = no
default_md = sha256

[ x509_distinguished_name ]
CN = Общее название (Должно отличаться от openssl.cnf иначе сертификаты будут считаться самоподписанными)
O = Название компании
L = Город
C = Регион

[ x509_ext ]
basicConstraints = critical,CA:false
keyUsage = critical,digitalSignature,keyEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names

[ alt_names ]
IP.1 = Доверенный адрес (IP сервера)
```
- Создание цетра сертификации
  
```
openssl genrsa -out ca-key.pem 4096
openssl req -x509 -new -nodes -key ca-key.pem -sha256 -days 365 -out ca.pem -config openssl.cnf
```
- Создание сертификата для Mongodb

```
openssl genrsa -out mongodb/mongodb-key.pem 4096
openssl req -new -key mongodb/mongodb-key.pem -out mongodb/mongodb.csr -config config.cnf
openssl x509 -req -in mongodb/mongodb.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out mongodb/mongodb-cert.pem -days 365 -sha256
cat mongodb/mongodb-cert.pem mongodb/mongodb-key.pem > mongodb/mongodb.pem
```
- Создание клиентского сертификата

```
openssl genrsa -out client-key.pem 4096
openssl req -new -key client-key.pem -out client.csr -config config.cnf
openssl x509 -req -in client.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out client-cert.pem -days 365 -sha256
cat client-cert.pem client-key.pem > client.pem
```
- Создание SSL сертификата для webhook
  
```
openssl req -x509 -newkey rsa:2048 -keyout bot/key.pem -out bot/cert.pem -days 365 -nodes -subj "/CN=IP_СЕРВЕРА"
```
[Подробнее об SSL для телеграм ботов](https://core.telegram.org/bots/self-signed)

#### Запуск и сборка

Для старта проекта (из корневой папки).

```cd .Docker && docker-compose --env-file ../.env up -d```

## Дополнительная информация

- Бот - мультиязычный и поддерживает два языка (русский и белорусский).
- По умолчанию проверка наличия новых объявлений выполняется раз в 15 минут (*/15).
- Директория **.github** нужна только для разработки и деплоя на сервер (ее можно удалить).

## Разработчик
- [Евгений Колмак](https://github.com/evgeniy-kolmak)

## Лицензия

Проект **Patrebna** распространяется по лицензии MIT.
