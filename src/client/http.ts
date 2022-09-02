import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import qs from 'qs';
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

  ins.interceptors.request.use((config: AxiosRequestConfig) => {
    const { method, data, params, url: initUrl } = config;

    let url = initUrl;
    if (method?.toUpperCase() === 'GET' && !!params) url += `?${qs.stringify(params)}`;

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
    await config?.responseCallback?.(e);

    if (['ETIMEDOUT', 'ECONNABORTED'].includes(e.code)) {
      if (config?.baseURL) return e.config;

      ins.defaults.baseURL = e.config.baseURL === hostURL[0] ? hostURL[1] : hostURL[0];
      e.config.baseURL = ins.defaults.baseURL;
    }
    await sleep();
    return ins(e.config);
  });

  return ins;
}

export const mixinRequest = http();
