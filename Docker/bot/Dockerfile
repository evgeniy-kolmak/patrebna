FROM node:alpine
RUN apk add --no-cache ca-certificates
COPY ../certs/ca.pem /usr/local/share/ca-certificates/ca.crt
RUN update-ca-certificate
WORKDIR /usr/src/app/
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start:bot"]