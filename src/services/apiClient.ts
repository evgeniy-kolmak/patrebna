import https from 'https';
import { readFileSync } from 'fs';
import axios, { AxiosError } from 'axios';

const HOST = process.env.HOST ?? '';
const agent = new https.Agent({
  ca: readFileSync('/usr/local/share/ca-certificates/ca.crt'),
});

export const api = axios.create({
  baseURL: `https://${HOST}/api/`,
  httpsAgent: agent,
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
