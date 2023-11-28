FROM alpine:3.17

ENV NODE_VERSION 21.2.0
ENV NPM_VERSION 10.1.0

RUN apk update && apk upgrade && \
  apk add --no-cache nodejs npm

RUN apk add --no-cache chromium

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npx", "ts-node", "src/index.ts"]
