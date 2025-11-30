import https from 'https';
import { readFileSync, existsSync } from 'fs';
import axios, { AxiosError } from 'axios';

const HOST = process.env.HOST ?? '';
let agent: https.Agent | undefined;
const caPath = '/usr/local/share/ca-certificates/ca.crt';
if (existsSync(caPath)) {
  agent = new https.Agent({ ca: readFileSync(caPath) });
}

export const api = axios.create({
  baseURL: `https://${HOST}/api`,
  ...(agent ? { httpsAgent: agent } : {}),
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (error instanceof AxiosError) {
      const { response, message, config } = error;
      console.error(`(${response?.status}) ${message} - ${config?.url}`);
    } else {
      console.error('Unexpected error', error);
    }
    return await Promise.reject(error);
  },
);
