import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { v4 as uuid } from 'uuid';
import { ResponseError } from './error';
import { Keystore } from './types/keystore';
import { RequestConfig } from './types/client';
import { signAccessToken } from './utils/auth';
import { sleep } from './utils/sleep';

const hostURL = ['https://mixin-api.zeromesh.net', 'https://api.mixin.one'];

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.headers.patch['Content-Type'] = 'application/json';
export function http(keystore?: Keystore, config?: RequestConfig): AxiosInstance {
  const ins = axios.create({
    baseURL: hostURL[0],
    timeout: 3000,
    ...config,
  });

  const retry = config?.retry || 5;
  let count = 0;

  ins.interceptors.request.use((config: AxiosRequestConfig) => {
    const { method, data, url } = config;
    if (config.headers) {
      const requestID = uuid();
      config.headers['X-Request-Id'] = requestID;
      const jwtToken = signAccessToken(method, url!, data, requestID, keystore);
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }

    return config;
  });

  ins.interceptors.response.use(async (res: AxiosResponse) => {
    const { data, error } = res.data;
    if (error) throw new ResponseError(error.code, error.description, error.status, error.extra, res.headers['x-request-id'], error);
    return data;
  });

  ins.interceptors.response.use(undefined, async (e: any) => {
    count++
    e.retryCount = count;
    e.retryNumber = retry;
    await config?.responseCallback?.(e);

    if (count >= retry) {
      count = 0;
      return Promise.reject(new Error(e.code));
    }

    if (['ETIMEDOUT', 'ECONNABORTED'].includes(e.code)) {
      if (config?.baseURL) return e.config;

      ins.defaults.baseURL = e.config.baseURL === hostURL[0] ? hostURL[1] : hostURL[0];
      e.config.baseURL = ins.defaults.baseURL;
    }

    // Error thrown in response onFulfilled interceptor or generated in runtime has no config,
    // but would still trigger another time of onFulfilled interceptor, then finish.
    // Reject here to void it.
    if (!e.config) return Promise.reject(e);

    await sleep();
    return ins(e.config);
  });

  return ins;
}

export const mixinRequest = http();
