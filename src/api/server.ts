import express from 'express';
import https from 'https';
import { readFileSync } from 'fs';
import webhookRoutes from 'api/routes/webhook.routes';

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
https.createServer(options, app).listen(PORT, () => {
  console.log(`The server is launched on the port ${PORT}`);
});
