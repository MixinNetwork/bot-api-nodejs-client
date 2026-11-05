import { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { Keystore } from './keystore';

export interface RequestConfig extends Partial<
  Pick<AxiosRequestConfig, 'baseURL' | 'headers' | 'timeout' | 'httpAgent' | 'httpsAgent' | 'onDownloadProgress' | 'onUploadProgress' | 'proxy'>
> {
  /** User-Agent header for HTTP requests made by this client. */
  userAgent?: string;
  responseCallback?: (rep: unknown) => void; // deprecated
  errorMap?: (error: any) => void;
  retry?: number;
}

export interface HTTPConfig {
  keystore: Keystore;
  requestConfig?: RequestConfig;
}

export interface BaseClient<KeystoreReturnType> {
  (config: HTTPConfig): KeystoreReturnType & RequestClient;
}

export type KeystoreClient<KeystoreReturnType extends object> = (axiosInstance: AxiosInstance, keystore: Keystore) => KeystoreReturnType;
export type BaseInnerClient<KeystoreReturnType extends object> = (axiosInstance: AxiosInstance) => KeystoreReturnType;
export type UnionKeystoreClient<KeystoreReturnType extends object> = BaseInnerClient<KeystoreReturnType> | KeystoreClient<KeystoreReturnType>;

export interface BuildClient {
  <KeystoreReturnType extends object>(KeystoreClient: UnionKeystoreClient<KeystoreReturnType>): BaseClient<KeystoreReturnType>;
}

export interface RequestClient {
  request: <T>(
    config: Partial<
      Pick<
        AxiosRequestConfig,
        'url' | 'method' | 'data' | 'params' | 'headers' | 'proxy' | 'httpAgent' | 'httpsAgent' | 'cancelToken' | 'baseURL' | 'onDownloadProgress' | 'onUploadProgress'
      >
    >,
  ) => Promise<T>;
}
