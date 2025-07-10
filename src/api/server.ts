import express from 'express';
import https from 'https';
import { readFileSync } from 'fs';
import webhookRoutes from 'api/routes/webhook.routes';
import 'dotenv/config';
import 'config/i18n/i18n';
import db from 'config/db/databaseServise';

const app = express();
const PORT = 3000;

const options = {
  ca: readFileSync('certs/ca.pem'),
  cert: readFileSync('certs/server.pem'),
  key: readFileSync('certs/server-key.pem'),
};
app.use(express.json());
app.use('/webhook', webhookRoutes);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
https.createServer(options, app).listen(PORT, async () => {
  await db.openConnection();
  console.log(`Cервер запущен на порту ${PORT}.`);
});
