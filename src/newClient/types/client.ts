import { AxiosRequestConfig } from 'axios';
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

export type PickFirstArg<F> = F extends (arg: infer P, ...args: any) => infer R ? (arg: P) => R : never;
