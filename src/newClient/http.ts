// @ts-ignore
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { v4 as uuid } from 'uuid';
import { ResponseError } from './error';
import { delay } from '../mixin/tools';
import { Keystore } from '../types';
import { signAuthenticationToken } from './utils/auth';

const hostURL = ['https://mixin-api.zeromesh.net', 'https://api.mixin.one'];

export function http(arg?: string | Keystore, config?: AxiosRequestConfig): AxiosInstance {
  const isCustomUrl = !!config?.baseURL;

  const ins = axios.create({
    baseURL: hostURL[0],
    headers: { 'Content-Type': 'application/json' },
    timeout: 3000,
    ...config,
  });

  let token: string | undefined;
  let keystore: Keystore | undefined; 

  if (typeof arg === 'string') {
    token = arg;
  } else {
    keystore = arg;
  }

  ins.interceptors.request.use((config: AxiosRequestConfig) => {
    const { method, data } = config;
    const uri = ins.getUri(config);
    const requestID = uuid();
    config.headers['X-Request-Id'] = requestID;
    const jwtToken = signAuthenticationToken(method, uri, data, keystore) || token || '';
    config.headers.Authorization = `Bearer ${jwtToken}`;
    return config;
  });

  ins.interceptors.response.use(
    (res: AxiosResponse) => {
      const { data, error } = res.data;
      if (error) throw new ResponseError(error.code, error.description, error.status, error.extra, res.headers['X-Request-Id'], error);

      return data;
    },
    async (e: any) => {
      if (['ETIMEDOUT', 'ECONNABORTED'].includes(e.code)) {
        if (isCustomUrl) return e.config;

        ins.defaults.baseURL = e.config.baseURL === hostURL[0] ? hostURL[1] : hostURL[0];
        e.config.baseURL = ins.defaults.baseURL;
      }
      await delay();
      return ins(e.config);
    },
  );
  return ins;
}

export const mixinRequest = http();
