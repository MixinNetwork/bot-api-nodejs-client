import { AxiosInstance, AxiosRequestConfig } from 'axios';
import Keystore from './keystore';

export interface ClientConfig {
  requestConfig?: Pick<AxiosRequestConfig, 'baseURL' | 'headers' | 'timeout' | 'httpAgent' | 'httpsAgent' | 'onDownloadProgress' | 'onUploadProgress' | 'proxy'>;
}

export interface TokenClientConfig extends ClientConfig {
  token: string;
}

export interface KeystoreClientConfig extends ClientConfig {
  keystore: Keystore;
}

export interface BaseClient<TokenReturnType, KeystoreReturnType> {
  (config: TokenClientConfig): TokenReturnType & RequestClient;
  (config: KeystoreClientConfig): TokenReturnType & KeystoreReturnType & RequestClient;
}

export type BaseInnerClient<KeystoreReturnType> = (axiosInstance: AxiosInstance) => KeystoreReturnType;
export type KeystoreClient<KeystoreReturnType> = (keystore: Keystore, axiosInstance: AxiosInstance) => KeystoreReturnType;
export type UnionKeystoreClient<KeystoreReturnType> = BaseInnerClient<KeystoreReturnType> | KeystoreClient<KeystoreReturnType>;

export interface BuildClient {
  <TokenReturnType, KeystoreReturnType>(config: { TokenClient: BaseInnerClient<TokenReturnType>; KeystoreClient: UnionKeystoreClient<KeystoreReturnType> }): BaseClient<
    TokenReturnType,
    KeystoreReturnType
  >;
  <TokenReturnType>(config: { TokenClient: BaseInnerClient<TokenReturnType> }): BaseClient<TokenReturnType, TokenReturnType>;
  <KeystoreReturnType>(config: { KeystoreClient: UnionKeystoreClient<KeystoreReturnType> }): BaseClient<KeystoreReturnType, KeystoreReturnType>;
}

export interface RequestClient {
  request: <T>(
    config: Pick<
      AxiosRequestConfig,
      'url' | 'method' | 'data' | 'headers' | 'proxy' | 'httpAgent' | 'httpsAgent' | 'cancelToken' | 'baseURL' | 'onDownloadProgress' | 'onUploadProgress'
    >,
  ) => Promise<T>;
}