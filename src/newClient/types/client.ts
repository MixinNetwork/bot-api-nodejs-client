import { AxiosInstance, AxiosRequestConfig } from 'axios';
import Keystore from './keystore';

export interface HTTPConfig {
  requestConfig?: Pick<AxiosRequestConfig, 'baseURL' | 'headers' | 'timeout' | 'httpAgent' | 'httpsAgent' | 'onDownloadProgress' | 'onUploadProgress' | 'proxy'>;
  token?: string;
  keystore?: Keystore;
}

export interface BaseClient<KeystoreReturnType> {
  (config: HTTPConfig): KeystoreReturnType & RequestClient;
}

export type BaseInnerClient<KeystoreReturnType> = (axiosInstance: AxiosInstance) => KeystoreReturnType;
export type KeystoreClient<KeystoreReturnType> = (axiosInstance: AxiosInstance, keystore?: Keystore) => KeystoreReturnType;
export type UnionKeystoreClient<KeystoreReturnType> = BaseInnerClient<KeystoreReturnType> | KeystoreClient<KeystoreReturnType>;

export interface BuildClient {
  <KeystoreReturnType>(config: { KeystoreClient: UnionKeystoreClient<KeystoreReturnType> }): BaseClient<
    KeystoreReturnType
>;
}

export interface RequestClient {
  request: <T>(
    config: Pick<
      AxiosRequestConfig,
      'url' | 'method' | 'data' | 'headers' | 'proxy' | 'httpAgent' | 'httpsAgent' | 'cancelToken' | 'baseURL' | 'onDownloadProgress' | 'onUploadProgress'
    >,
  ) => Promise<T>;
}
