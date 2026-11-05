import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry, { isIdempotentRequestError } from 'axios-retry';
import { v4 as uuid } from 'uuid';
import isRetryAllowed from 'is-retry-allowed';
import type { Keystore } from './types/keystore';
import type { RequestConfig } from './types/client';
import { ResponseError } from './error';
import { signAccessToken } from './utils/auth';

const API_ORIGIN = 'https://api.mixin.one';

const validatePath = (uri: string) => {
  let pathEnd = uri.search(/[?#]/);
  if (pathEnd === -1) {
    pathEnd = uri.length;
    // WHATWG URL parsing trims trailing C0 controls and ASCII spaces.
    while (pathEnd > 0 && uri.charCodeAt(pathEnd - 1) <= 0x20) pathEnd -= 1;
  }
  const path = uri.slice(0, pathEnd).replace(/[\t\n\r]/g, '');
  if (/(?:^|[/\\])(?:\.|%2e){1,2}(?:[/\\]|$)/i.test(path)) throw new Error('Invalid API path: dot segments are not allowed');
};

export function http(keystore: Keystore, config?: RequestConfig): AxiosInstance {
  const timeout = config?.timeout ?? 3000;
  const retries = config?.retry ?? 5;

  const ins = axios.create({
    baseURL: API_ORIGIN,
    timeout,
    ...config,
    headers: {
      post: { 'Content-Type': 'application/json' },
      put: { 'Content-Type': 'application/json' },
      patch: { 'Content-Type': 'application/json' },
      ...(config?.headers ?? {}),
      ...(config?.userAgent !== undefined ? { 'User-Agent': config.userAgent } : {}),
    },
  });

  ins.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const { method, data } = config;
    // Check before URL normalization, both before and after query parameters are added.
    validatePath(axios.getUri({ ...config, params: null }));
    const uri = axios.getUri(config);
    validatePath(uri);
    // Require an absolute URL so browser transports cannot resolve it against the page's origin.
    const { origin, pathname, search } = new URL(uri);
    if (origin !== API_ORIGIN) throw new Error(`Invalid API origin: requests must target ${API_ORIGIN}`);
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
