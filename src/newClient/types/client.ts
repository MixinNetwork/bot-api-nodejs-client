import { AxiosInstance, AxiosRequestConfig } from 'axios';
import Keystore from './keystore';

export interface ClientConfig {
  axiosConfig?: AxiosRequestConfig;
}

export interface TokenClientConfig extends ClientConfig {
  token: string;
}

export interface KeystoreClientConfig extends ClientConfig {
  keystore: Keystore;
}

export interface BaseClient<TokenReturnType, KeystoreReturnType> {
  (config: TokenClientConfig): TokenReturnType;
  (config: KeystoreClientConfig): TokenReturnType & KeystoreReturnType;
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
