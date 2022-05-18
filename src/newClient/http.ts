// @ts-ignore
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ResponseError } from './error';
import { v4 as uuid } from 'uuid';
import { KeystoreAuth } from '../mixin/keystore';
import { signRequest } from '../mixin/sign';
import { delay } from '../mixin/tools';
import { Keystore } from '../types';

const hostURL = ['https://mixin-api.zeromesh.net', 'https://api.mixin.one'];

export function http(arg?: string | Keystore, config?: AxiosRequestConfig): AxiosInstance {
  const isCustomUrl = !!config?.baseURL;

  const ins = axios.create({
    baseURL: hostURL[0],
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    timeout: 3000,
    ...config,
  });

  let token: string | undefined;
  let k: KeystoreAuth | undefined;

  if (typeof arg === 'string') {
    token = arg;
  } else {
    k = new KeystoreAuth(arg);
  }

  ins.interceptors.request.use((config: AxiosRequestConfig) => {
    const { method, data } = config;
    const uri = ins.getUri(config);
    const requestID = uuid();
    config.headers['x-request-id'] = requestID;
    const jwtToken = token || k?.signToken(signRequest(method!, uri, data), requestID) || '';
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
