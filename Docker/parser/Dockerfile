FROM node:alpine
RUN apk add --no-cache ca-certificates tzdata
COPY ../certs/ca.pem /usr/local/share/ca-certificates/ca.crt
RUN update-ca-certificates
RUN cp /usr/share/zoneinfo/Europe/Moscow /etc/localtime && echo "Europe/Moscow" > /etc/timezone
WORKDIR /usr/src/app/
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start:parser"]