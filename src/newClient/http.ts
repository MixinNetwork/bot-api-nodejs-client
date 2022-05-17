import axios, { AxiosInstance, Method } from 'axios';
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

  request(method: Method, path: string, data: object | string = '') {
    if (this.token) {
      return this.requestByToken(method, path, data, this.token);
    }
    const token = Utils.signAuthenticationToken(
      String(method),
      path,
      data,
      this.keystore,
    );
    return this.requestByToken(method, path, data, token);
  }

  requestByToken(method: Method, path: string, data: object | string = '', token: string = ''): AxiosInstance {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      timeout: 3000, // TODO developer can setup timeout
    };

    return axios.create({
      method,
      url: this.host + path,
      data,
      headers,
    });
  }
}

export default HTTP;
