import axios, { Method, AxiosResponse } from 'axios';
import { ApiError } from './error';
import Keystore from './types/keystore';
import Utils from './utils/utils';

class HTTP {
  static GlobalHost: string = 'https://mixin-api.zeromesh.net';

  static AbroadHost: string = 'https://api.mixin.one';

  keystore: Keystore;

  host: string;

  token: string;

  constructor(raw: Keystore | undefined) {
    this.keystore = raw!;
    this.host = raw?.host || HTTP.GlobalHost;
    this.token = raw?.authorization_token!;
  }

  setHost(host: string) {
    this.host = host;
  }

  setToken(token: string) {
    this.token = token;
  }

  request<T>(method: Method, path: string, data: object | string = ''): Promise<T> {
    if (this.token) {
      return this.requestByToken(method, path, data, this.token);
    }
    const token = Utils.signAuthenticationToken(String(method), path, data, this.keystore);
    return this.requestByToken(method, path, data, token);
  }

  requestByToken<T = any>(method: Method, path: string, data: object | string = '', token: string = ''): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      timeout: 3000, // TODO developer can setup timeout
    };

    const instance = axios.create({
      method,
      url: this.host + path,
      data,
      headers,
    });

    instance.interceptors.response.use(
      (res: AxiosResponse) => {
        const { data, error } = res.data;
        if (error) {
          throw new ApiError(error.code, error.description, error.status, error.extra, res.headers['X-Request-Id'], error);
        }
        return data;
      },
      (e: any) => {
        if (['ETIMEDOUT', 'ECONNABORTED'].includes(e.code)) {
          instance.defaults.baseURL = e.config.baseURL === HTTP.GlobalHost ? HTTP.AbroadHost : HTTP.GlobalHost;
          e.config.baseURL = instance.defaults.baseURL;
        }
        return instance(e.config);
      },
    );
    return instance.request({});
  }
}

export default HTTP;
