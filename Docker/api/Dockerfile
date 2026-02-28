FROM node:18-alpine 
RUN apk add --no-cache \
  tzdata \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  udev \
  bash \
  curl \
  alsa-lib \
  libxcomposite \
  libxdamage \
  libxrandr \
  libx11
RUN cp /usr/share/zoneinfo/Europe/Moscow /etc/localtime && echo "Europe/Moscow" > /etc/timezone
WORKDIR /usr/src/app/
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:server"]