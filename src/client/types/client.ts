import { AxiosInstance, AxiosRequestConfig } from 'axios';
import Keystore from './keystore';
import { BlazeOptions } from './blaze';

export interface RequestConfig
  extends Pick<AxiosRequestConfig, 'baseURL' | 'headers' | 'timeout' | 'httpAgent' | 'httpsAgent' | 'onDownloadProgress' | 'onUploadProgress' | 'proxy'> {
  responseCallback?: (rep: unknown) => void;
  retry?: number;
}

export interface HTTPConfig {
  blazeOptions?: BlazeOptions;
  keystore?: Keystore;
  requestConfig?: RequestConfig;
}

export interface BaseClient<KeystoreReturnType> {
  (): KeystoreReturnType & RequestClient;
  (config: HTTPConfig): KeystoreReturnType & RequestClient;
}

export type BaseInnerClient<KeystoreReturnType> = (axiosInstance: AxiosInstance) => KeystoreReturnType;
export type KeystoreClient<KeystoreReturnType> = (axiosInstance: AxiosInstance, keystore?: Keystore) => KeystoreReturnType;
export type UnionKeystoreClient<KeystoreReturnType> = BaseInnerClient<KeystoreReturnType> | KeystoreClient<KeystoreReturnType>;

export interface BuildClient {
  <KeystoreReturnType>(KeystoreClient: UnionKeystoreClient<KeystoreReturnType>): BaseClient<KeystoreReturnType>;
}

export interface RequestClient {
  request: <T>(
    config: Pick<
      AxiosRequestConfig,
      'url' | 'method' | 'data' | 'headers' | 'proxy' | 'httpAgent' | 'httpsAgent' | 'cancelToken' | 'baseURL' | 'onDownloadProgress' | 'onUploadProgress'
    >,
  ) => Promise<T>;
}
