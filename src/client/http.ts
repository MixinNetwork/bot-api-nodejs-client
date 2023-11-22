import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry, { isIdempotentRequestError } from 'axios-retry';
import { v4 as uuid } from 'uuid';
import isRetryAllowed from 'is-retry-allowed';
import { ResponseError } from './error';
import { Keystore } from './types/keystore';
import { RequestConfig } from './types/client';
import { signAccessToken } from './utils/auth';

const hostURL = ['https://api.mixin.one', 'https://mixin-api.zeromesh.net'];

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.headers.patch['Content-Type'] = 'application/json';
export function http(keystore?: Keystore, config?: RequestConfig): AxiosInstance {
  const timeout = config?.timeout || 3000;
  const retries = config?.retry || 5;

  const ins = axios.create({
    baseURL: hostURL[0],
    timeout,
    ...config,
  });

  ins.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const { method, data } = config;
    const url = axios.getUri(config).slice(config.baseURL?.length);

    if (config.headers) {
      const requestID = uuid();
      config.headers['X-Request-Id'] = requestID;
      const jwtToken = signAccessToken(method, url, data, requestID, keystore);
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

    return Promise.reject(e);
  });

  axiosRetry(ins, {
    retries,
    shouldResetTimeout: true,
    retryDelay: () => 500,
    retryCondition: error =>
      (!error.response &&
        Boolean(error.code) && // Prevents retrying cancelled requests
        isRetryAllowed(error)) ||
      isIdempotentRequestError(error),
    onRetry: (_count, err, requestConfig) => {
      if (config?.baseURL) return;
      requestConfig.baseURL = err.config?.baseURL === hostURL[0] ? hostURL[1] : hostURL[0];
      ins.defaults.baseURL = err.config?.baseURL === hostURL[0] ? hostURL[1] : hostURL[0];
    },
  });

  return ins;
}

export const mixinRequest = http();
