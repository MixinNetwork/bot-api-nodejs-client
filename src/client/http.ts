import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { v4 as uuid } from 'uuid';
import { ResponseError } from './error';
import { Keystore } from './types/keystore';
import { signAccessToken } from './utils/auth';
import { sleep } from './utils/sleep';

const hostURL = ['https://mixin-api.zeromesh.net', 'https://api.mixin.one'];

export function http(keystore?: Keystore, config?: AxiosRequestConfig, responseCallback?: (res: AxiosResponse) => void ): AxiosInstance {
  const ins = axios.create({
    baseURL: hostURL[0],
    headers: { 'Content-Type': 'application/json' },
    timeout: 3000,
    ...config,
  });

  ins.interceptors.request.use((config: AxiosRequestConfig) => {
    const { method, data } = config;
    const uri = ins.getUri(config);
    const requestID = uuid();
    config.headers['X-Request-Id'] = requestID;

    const jwtToken = signAccessToken(method, uri, data, requestID, keystore);
    config.headers.Authorization = `Bearer ${jwtToken}`;

    return config;
  });

  ins.interceptors.response.use(
    (res: AxiosResponse) => {
      const { data, error } = res.data;
      if (responseCallback) {
        responseCallback(res);
      }
      if (error) throw new ResponseError(error.code, error.description, error.status, error.extra, res.headers['X-Request-Id'], error);
      return data;
    },
    async (e: any) => {
      if (['ETIMEDOUT', 'ECONNABORTED'].includes(e.code)) {
        if (config?.baseURL) return e.config;

        ins.defaults.baseURL = e.config.baseURL === hostURL[0] ? hostURL[1] : hostURL[0];
        e.config.baseURL = ins.defaults.baseURL;
      }
      await sleep();
      return ins(e.config);
    },
  );
  return ins;
}

export const mixinRequest = http();