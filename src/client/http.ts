import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry, { isIdempotentRequestError } from 'axios-retry';
import { v4 as uuid } from 'uuid';
import isRetryAllowed from 'is-retry-allowed';
import type { Keystore } from './types/keystore';
import type { RequestConfig } from './types/client';
import { ResponseError } from './error';
import { signAccessToken } from './utils/auth';

export function http(keystore: Keystore, config?: RequestConfig): AxiosInstance {
  const timeout = config?.timeout ?? 3000;
  const retries = config?.retry ?? 5;

  const ins = axios.create({
    baseURL: 'https://api.mixin.one',
    timeout,
    ...config,
    headers: {
      post: { 'Content-Type': 'application/json' },
      put: { 'Content-Type': 'application/json' },
      patch: { 'Content-Type': 'application/json' },
      ...(config?.headers ?? {}),
    },
  });

  ins.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const { method, data } = config;
    const { pathname, search } = new URL(axios.getUri(config), 'https://api.mixin.one');
    const url = pathname + search;

    const requestID = uuid();
    config.headers['X-Request-Id'] = requestID;
    const token = signAccessToken(method, url, data, requestID, keystore);
    if (!token) throw new Error('Invalid keystore: unable to sign API request');
    config.headers.set('Authorization', `Bearer ${token}`, true);

    return config;
  });

  ins.interceptors.response.use(async (res: AxiosResponse) => {
    const { data, error } = res.data;
    if (error) throw new ResponseError(error.code, error.description, error.status, error.extra, res.config.headers['X-Request-Id'], error);
    return data;
  });

  ins.interceptors.response.use(undefined, async (e: any) => {
    await config?.responseCallback?.(e);
    await config?.errorMap?.(e);
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
  });

  return ins;
}
